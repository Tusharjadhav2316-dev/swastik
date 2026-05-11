
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { buildSystemPrompt } from "@/lib/prompts";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── All MCP Tool Definitions for Groq function calling ────────────────────────
const GROQ_TOOLS: Groq.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_time",
      description: "Get the current accurate time, date and day of week for any timezone.",
      parameters: {
        type: "object",
        properties: {
          timezone: { type: "string", description: "IANA timezone, e.g. Asia/Kolkata", default: "Asia/Kolkata" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_system_info",
      description: "Get SWASTIK system status and health of all intelligence modules.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_news",
      description: "Fetch the latest news articles on any topic (NewsAPI + GDELT fallback).",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Topic or keywords to search news for" },
          limit: { type: "number", description: "Number of articles (default 8, max 20)" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Get current weather conditions for any city using OpenWeatherMap.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name, e.g. Mumbai, London, New York" },
        },
        required: ["city"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "open_app",
      description: "Open any app by name (Spotify, YouTube, WhatsApp, Netflix, Swiggy, GitHub, etc). Returns the web URL and mobile deep link.",
      parameters: {
        type: "object",
        properties: {
          app_name: { type: "string", description: "App name to open, e.g. spotify, youtube, whatsapp" },
        },
        required: ["app_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "send_message",
      description: "Compose a message on WhatsApp, Gmail, or Telegram. Returns a compose URL.",
      parameters: {
        type: "object",
        properties: {
          platform: { type: "string", enum: ["whatsapp", "gmail", "telegram"] },
          recipient: { type: "string", description: "Phone number for WhatsApp, email for Gmail, username for Telegram" },
          message: { type: "string", description: "Message to pre-fill" },
        },
        required: ["platform"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "play_music",
      description: "Play music or video via Invidious (YouTube) or Deezer. No API key needed.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Song or video to search" },
          platform: { type: "string", enum: ["youtube", "spotify"], default: "youtube" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "fetch_world_intelligence",
      description: "Get live global conflict data and intelligence pins from GDELT for the 3D globe.",
      parameters: { type: "object", properties: {} },
    },
  },
];

// ── Call MCP tool via Next.js internal proxy ──────────────────────────────────
async function callMcpTool(
  toolName: string,
  toolArgs: Record<string, unknown>,
  reqOrigin: string,
  cookieHeader: string
): Promise<unknown> {
  const res = await fetch(`${reqOrigin}/api/mcp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({ tool: toolName, input: toolArgs }),
    signal: AbortSignal.timeout(12_000),
  });
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let uid: string;
    try {
      const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const { message, sessionId, mode = "student", emotion = "neutral" } = await req.json();
    if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

    // ── Load user context ─────────────────────────────────────────────────────
    const userDoc = await adminDb.collection("users").doc(uid).get();
    const userData = userDoc.data() || {};
    const userName = userData.displayName || "User";

    const memorySnapshot = await adminDb
      .collection("users").doc(uid).collection("memory").get();
    const userMemory =
      memorySnapshot.docs.map(d => `${d.id}: ${JSON.stringify(d.data())}`).join("\n") ||
      "No previous memory stored.";

    let history: Groq.Chat.ChatCompletionMessageParam[] = [];
    try {
      const snap = await adminDb
        .collection("users").doc(uid).collection("conversations")
        .orderBy("createdAt", "desc").limit(20).get();
      history = snap.docs
        .map(d => ({ role: d.data().role as "user" | "assistant", content: d.data().content }))
        .reverse();
    } catch {}

    const systemPrompt = buildSystemPrompt({
      mode, userName,
      goals: userData.goals || "None",
      weakTopic: userData.weakTopic || "None",
      userMemory,
      streak: userData.streak || 0,
      pendingTasks: "None",
      currentTime: new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }),
      emotion,
    });

    // ── Groq agentic tool-calling loop ────────────────────────────────────────
    let messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message },
    ];

    let visualSignal: { visualType: string; data: unknown } | null = null;
    const cookieHeader = req.headers.get("cookie") || "";
    const origin = req.nextUrl.origin;

    // Loop until stop or max 5 iterations (prevent infinite loops)
    for (let iteration = 0; iteration < 5; iteration++) {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        tools: GROQ_TOOLS,
        tool_choice: "auto",
        max_tokens: 2048,
      });

      const choice = completion.choices[0];
      const responseMessage = choice.message;
      messages.push(responseMessage);

      // ── Stop condition ────────────────────────────────────────────────────
      if (choice.finish_reason === "stop" || !responseMessage.tool_calls?.length) {
        break;
      }

      // ── Execute tool calls ────────────────────────────────────────────────
      for (const toolCall of responseMessage.tool_calls) {
        const toolName = toolCall.function.name;
        let toolArgs: Record<string, unknown> = {};
        try {
          toolArgs = JSON.parse(toolCall.function.arguments);
        } catch {}

        console.log(`SWASTIK: Tool call [${iteration}] → ${toolName}`, toolArgs);

        let toolResult: unknown;
        try {
          toolResult = await callMcpTool(toolName, toolArgs, origin, cookieHeader);
        } catch (e) {
          toolResult = { error: `Tool '${toolName}' failed: ${e}` };
        }

        // Capture visual signals for stream
        const td = toolResult as Record<string, unknown>;
        if (toolName === "fetch_world_intelligence" && td?.globePins) {
          visualSignal = { visualType: "globe", data: td.globePins };
        } else if (toolName === "play_music" && td?.action === "embed_player") {
          visualSignal = { visualType: "player", data: { url: td.embedUrl, platform: td.platform } };
        } else if (toolName === "open_app" && td?.webUrl) {
          visualSignal = { visualType: "app_open", data: { webUrl: td.webUrl, deepLink: td.deepLink, appName: td.appName } };
        } else if (toolName === "get_weather" && td?.temperature !== undefined) {
          visualSignal = { visualType: "weather", data: toolResult };
        }

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult),
        });
      }
    }

    // ── Extract final text response ───────────────────────────────────────────
    const lastMessage = messages[messages.length - 1];
    const fullResponse =
      (lastMessage.role === "assistant" ? lastMessage.content : null) || "Done boss.";

    // ── Stream response back to client ────────────────────────────────────────
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        // 1. Send visual signal first (if any)
        if (visualSignal) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "visual", ...visualSignal })}\n\n`)
          );
        }

        // 2. Stream text word by word
        const words = (fullResponse as string).split(" ");
        for (const word of words) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "text", content: word + " " })}\n\n`)
          );
          await new Promise(r => setTimeout(r, 18));
        }

        // 3. Persist conversation
        try {
          const createdAt = new Date();
          const batch = adminDb.batch();
          const uRef = adminDb.collection("users").doc(uid).collection("conversations").doc();
          batch.set(uRef, { role: "user", content: message, sessionId, createdAt });
          const aRef = adminDb.collection("users").doc(uid).collection("conversations").doc();
          batch.set(aRef, {
            role: "assistant",
            content: fullResponse,
            sessionId,
            createdAt: new Date(createdAt.getTime() + 100),
          });
          await batch.commit();
        } catch (e) {
          console.error("SWASTIK: Failed to save conversation:", e);
        }

        // 4. Done signal
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("SWASTIK chat error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
