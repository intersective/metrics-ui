// openaiHelper.js
import { OpenAI } from 'openai'; // Import OpenAI SDK
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure the API key is loaded from the environment
});

// Helper function to create a thread, start a run, and poll for completion
const sendToGPTAssistant = async (assistantId: string, message: string, threadId: string) => {
  try {
    if (!threadId) {
      // Step 1: Create a thread
      const threadResponse = await openai.beta.threads.create();
      threadId = threadResponse.id;
      console.log('Thread ID:', threadId);  
    }
      
    // Step 2: Add the user message to the thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });
    const results = [];
    // Step 3: Start a run within the thread, associate it with the assistant
    const runResponse = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistantId,
    });
    console.log('Run:', runResponse);
    // Check if the run was completed successfully
    if (runResponse.status === 'completed') {
      // Step 4: Retrieve all messages from the thread to get the final output
      const messages = await openai.beta.threads.messages.list(runResponse.thread_id);

      results.push({"thread_id": threadId});
      // Concatenate all message content from the assistant
      for (const message of messages.data.reverse()) {
        if (message.role === 'assistant') {
          console.log('message content', message.content);
          if ('text' in message.content[0]) {
            // strip all text before the first { and after the last }
            const text = message.content[0].text.value;
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            const stripped = text.substring(start, end + 1);
            // is stripped a parsable json object? if so, add it to the results
            try {
              const parsed = JSON.parse(stripped);
              results.push(parsed); 
            } catch (error) {
                if (error instanceof Error) {
                  results.push({ "answer": text, "error": error.message, "stripped": stripped });
                } else {
                  results.push({ "answer": text, "error": 'Unknown error', "stripped": stripped });
                }
            }
          }
        }
      }
      return results;
    } else {
      console.log('Run Status:', runResponse.status);
      return null; // You can handle non-completed cases if needed
    }
  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
    throw error;
  }
};

export {
  sendToGPTAssistant,
};