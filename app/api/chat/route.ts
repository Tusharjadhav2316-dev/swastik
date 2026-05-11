
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { buildSystemPrompt } from "@/lib/prompts";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let uid: string;
    try {
      const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
      uid = decodedToken.uid;
    } catch (e: any) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const { message, sessionId, mode = "student", emotion = "neutral" } = await req.json();
    if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

    const userDoc = await adminDb.collection("users").doc(uid).get();
    const userData = userDoc.data() || {};
    const userName = userData.displayName || "User";

    const memorySnapshot = await adminDb.collection("users").doc(uid).collection("memory").get();
    const memoryItems = memorySnapshot.docs.map(doc => `${doc.id}: ${JSON.stringify(doc.data())}`);
    const userMemory = memoryItems.length > 0 ? memoryItems.join("\n") : "No previous memory stored.";

    let history: { role: "system" | "user" | "assistant"; content: string }[] = [];
    try {
      const historySnapshot = await adminDb.collection("users").doc(uid).collection("conversations")
        .orderBy("createdAt", "desc").limit(20).get();
      history = historySnapshot.docs.map(doc => ({
        role: doc.data().role as "user" | "assistant",
        content: doc.data().content,
      })).reverse();
    } catch (e) {}

    const tools: any[] = [
      {
        type: "function",
        function: {
          name: "get_time_and_date",
          description: "Get the current accurate time and date",
          parameters: { type: "object", properties: {} },
        },
      },
      {
        type: "function",
        function: {
          name: "fetch_world_intelligence",
          description: "Get live global conflict data and intelligence pins for the 3D globe (via GDELT)",
          parameters: { type: "object", properties: {} },
        },
      },
      {
        type: "function",
        function: {
          name: "play_music",
          description: "Play music or video using free Invidious/Deezer providers. No API keys required.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "The song or video to search for" },
              platform: { type: "string", enum: ["youtube", "spotify"], default: "youtube", description: "Choose youtube for video or spotify for music" }
            },
            required: ["query"]
          },
        },
      },
    ];

    const systemPrompt = buildSystemPrompt({
      mode, userName, goals: userData.goals || "None", weakTopic: userData.weakTopic || "None",
      userMemory, streak: userData.streak || 0, pendingTasks: "None",
      currentTime: new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }),
      emotion
    });

    let messages: any[] = [{ role: "system", content: systemPrompt }, ...history, { role: "user", content: message }];

    let completion: any = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      tools,
      tool_choice: "auto",
    });

    let responseMessage = completion.choices[0].message;

    let visualSignal = null;

    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      messages.push(responseMessage);
      for (const toolCall of responseMessage.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);
        
        console.log(`SWASTIK: Executing tool ${toolName}...`);

        if (toolName === "get_time_and_date") {
          messages.push({ tool_call_id: toolCall.id, role: "tool", name: toolName, content: new Date().toLocaleString() });
        } else {
          // Forward all other tools to the MCP Python server via our proxy
          try {
            const mcpRes = await fetch(`${req.nextUrl.origin}/api/mcp`, {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Cookie": req.headers.get("cookie") || "" // Pass session cookie for auth
              },
              body: JSON.stringify({ tool: toolName, input: toolArgs }),
            });
            const toolData = await mcpRes.json();
            
            // Capture visual signal for stream
            if (toolName === 'fetch_world_intelligence') {
              visualSignal = { type: 'globe', data: toolData.globePins };
            } else if (toolName === 'play_music' && toolData.action === 'embed_player') {
              visualSignal = { type: 'player', data: { url: toolData.embedUrl, platform: toolData.platform } };
            }

            messages.push({ 
              tool_call_id: toolCall.id, 
              role: "tool", 
              name: toolName, 
              content: JSON.stringify(toolData) 
            });
          } catch (e) {
            console.error(`Tool ${toolName} failed:`, e);
            messages.push({ tool_call_id: toolCall.id, role: "tool", name: toolName, content: "Error executing tool." });
          }
        }
      }
      completion = await groq.chat.completions.create({ model: "llama-3.3-70b-versatile", messages });
      responseMessage = completion.choices[0].message;
    }

    const fullResponse = responseMessage.content || "Done.";
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        // Send visual signal first if present
        if (visualSignal) {
          const { type: visualType, ...visualRest } = visualSignal as { type: string; data: unknown };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "visual", visualType, ...visualRest })}\n\n`));
        }

        const chunks = fullResponse.split(" ");
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text", content: chunk + " " })}\n\n`));
          await new Promise(r => setTimeout(r, 20));
        }
        
        const createdAt = new Date();
        const batch = adminDb.batch();
        const uRef = adminDb.collection("users").doc(uid).collection("conversations").doc();
        batch.set(uRef, { role: "user", content: message, sessionId, createdAt });
        const aRef = adminDb.collection("users").doc(uid).collection("conversations").doc();
        batch.set(aRef, { role: "assistant", content: fullResponse, sessionId, createdAt: new Date(createdAt.getTime() + 100) });
        await batch.commit();

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
        controller.close();
      }
    });

    return new Response(readable, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
