import dotenv from 'dotenv';
import { sendToGPTAssistant } from '@/lib/openaiHelper'; // Import the helper function
import { NextRequest, NextResponse } from 'next/server';
dotenv.config();

export async function POST(req: NextRequest) {

  const assistantId = process.env.OPENAI_ASSISTANT_ID ?? null; // Ensure this ID is set in your .env file
  if (!assistantId) {
    throw new Error('Assistant ID is required');
  }
  const body = await req.json();
  const prompt = body.message;
  const threadId = body.threadId;

  try {
      // Call the helper function to communicate with OpenAI
      const result = await sendToGPTAssistant(assistantId, prompt, threadId);
      if (!result) {
        throw new Error('No response from assistant');
      }
      return NextResponse.json(result);
    } catch (error) { 
        console.error('Error fetching response:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
