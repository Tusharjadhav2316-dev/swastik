
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      await adminAuth.verifySessionCookie(sessionCookie);
    } catch (e) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const { tool, input } = await req.json();
    console.log(`SWASTIK: Proxying tool ${tool} to Python server...`);

    // In a real FastMCP SSE setup, we might need to handle the specific transport
    // but for simplicity, we'll assume a direct tool call endpoint if available
    // or use the MCP protocol. For this migration, we'll use a direct fetch to the server's tool handler.
    
    // Note: FastMCP usually handles tool calls via its internal protocol.
    // We'll simulate the tool execution by calling the server.
    
    const res = await fetch(`${MCP_SERVER_URL}/tools/${tool}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Python server error: ${errorText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("MCP Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
