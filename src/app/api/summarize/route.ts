import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { transaction } = body;

    const prompt = `
You are an AI that summarizes Sui blockchain transactions in a clear, human-friendly format.
- Translate addresses to user-friendly names if provided (e.g., "Alice", "Bob").
- Summarize key actions in short, readable sentences:
  Example: "Alice transferred NFT #1234 to Bob."
  Example: "2 new objects were created."
  Example: "Gas used: 0.015 SUI."
- Include the starting Move function of the transaction if available.
- Highlight mutated objects and their fields in a simple, non-JSON way.
- Optionally, provide a minimal visual representation using arrows (e.g., sender → recipient).
- Use concise language, one sentence per main action.
- Do not output raw JSON; keep it readable for non-technical users.
- Important: Only produce a short summary with plain language; nothing else.

Transaction data:
${JSON.stringify(transaction)}
`;

    const result = await client.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        { role: "system", content: "You are a tool that helps users understand Sui blockchain transactions in simple language." },
        { role: "user", content: prompt }
      ]
    });

    return NextResponse.json({
      summary: result.choices[0].message.content
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
