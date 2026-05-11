import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Firebase session
    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userId: string;
    try {
      const decoded = await adminAuth.verifySessionCookie(sessionCookie);
      userId = decoded.uid;
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // 2. Parse request body
    const body = await req.json();
    const { tool, input } = body as { tool: string; input: Record<string, unknown> };

    if (!tool) {
      return NextResponse.json({ error: "Missing 'tool' field" }, { status: 400 });
    }

    console.log(`SWASTIK MCP: user=${userId} tool=${tool} input=`, input);

    // 3. Forward to Python FastMCP server
    const res = await fetch(`${MCP_SERVER_URL}/tools/${tool}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, userId }),
      signal: AbortSignal.timeout(15_000), // 15s timeout
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`SWASTIK MCP: Python server error for tool '${tool}':`, err);
      return NextResponse.json({ error: `Tool failed: ${err}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("SWASTIK MCP proxy error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
