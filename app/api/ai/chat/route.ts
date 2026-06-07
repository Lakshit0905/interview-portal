import { NextRequest, NextResponse } from "next/server";
import { llm, AI_ENABLED, type LLMMessage } from "@/lib/ai/client";

const SYSTEM =
  "You are an expert Senior SDET / QA Automation interview coach. " +
  "Answer concisely and practically, with concrete examples where useful.";

export async function POST(req: NextRequest) {
  const { messages } = (await req.json()) as { messages?: LLMMessage[] };
  if (!messages?.length) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  if (!AI_ENABLED) {
    return NextResponse.json({
      enabled: false,
      reply:
        "AI is in offline mode. Set ANTHROPIC_API_KEY in your environment to enable Claude-powered coaching here.",
    });
  }

  try {
    const reply = await llm(SYSTEM, messages, 1024);
    return NextResponse.json({ enabled: true, reply });
  } catch (err) {
    return NextResponse.json(
      { enabled: true, error: err instanceof Error ? err.message : "AI request failed" },
      { status: 502 },
    );
  }
}
