import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { formTitle } = await request.json();

    if (!formTitle) {
      return NextResponse.json({ message: 'Form title is required' }, { status: 400 });
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates form field titles and section subtitles. Respond with a JSON object: { \"fields\": [\"Field 1\", \"Field 2\"], \"sectionTitle\": \"title\" }.",
        },
        {
          role: "user",
          content: `Generate up to 3 relevant and concise form field titles and a section subtitle for a form titled "${formTitle}".`,
        },
      ],
    });
    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json({ message: 'Failed to generate fields' }, { status: 500 });
  }
}