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
${process.env.ai_promt}
${JSON.stringify(transaction)}
`;

    const result = await client.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        { role: "system", content: "You are a tool that helps users understand Sui blockchain transactions in simple language.No Follow up questions or later help.Just answer.prompt tokens 200" },
        { role: "user", content: prompt }
      ]
      
    });
  console.log("AI Summary Result:", result.choices[0].message);
    return NextResponse.json({
      summary: result.choices[0].message.content

    });
    console.log("AI Summary Result:", result.choices[0].message.content);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
