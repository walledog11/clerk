import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { db } from '@clerk/db'; 
import dotenv from 'dotenv';
import OpenAI from 'openai'; // <-- Added the OpenAI import

dotenv.config();

// Initialize OpenAI so the worker has a brain
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// BullMQ requires a dedicated Redis connection with maxRetriesPerRequest set to null
const redisConnection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

// Initialize the worker to listen to the exact same queue the webhook route writes to
const messageWorker = new Worker('inbound-messages', async (job) => {
  console.log(`[Worker] Picked up job ${job.id} for platform: ${job.data.platform}`);

  if (job.data.platform === 'ig_dm') {
    const { rawPayload } = job.data;
    
    // 1. Drill down into Meta's nested JSON payload
    const messagingEvent = rawPayload.entry[0]?.messaging[0];
    if (!messagingEvent || !messagingEvent.message || !messagingEvent.message.text) {
      return; 
    }

    const senderId = messagingEvent.sender.id; 
    const messageText = messagingEvent.message.text;

    try {
      // 2. Find or Create the Customer in PostgreSQL
      const customer = await db.customer.upsert({
        where: { platformId: senderId },
        update: {}, 
        create: { platformId: senderId }
      });

      // 3. Find an active thread, or create a new one
      let thread = await db.thread.findFirst({
        where: { 
          customerId: customer.id,
          status: 'open',
          channelType: 'ig_dm'
        }
      });

      if (!thread) {
        thread = await db.thread.create({
          data: {
            customerId: customer.id,
            channelType: 'ig_dm',
            status: 'open'
          }
        });
      }

      // 4. Save the actual chat bubble
      await db.message.create({
        data: {
          threadId: thread.id,
          senderType: 'customer',
          contentText: messageText,
        }
      });

      // --- NEW AI SUMMARIZATION ENGINE ---
      try {
        // FIXED: We grab the ID directly from the thread variable we defined in Step 3!
        const threadId = thread.id;
        
        console.log(`[Worker] Generating AI Summary for thread ${threadId}...`);
      
        // 1. Fetch the entire thread history for context
        const fullThread = await db.thread.findUnique({
          where: { id: threadId },
          include: { messages: { orderBy: { sentAt: 'asc' } } }
        });

        // 2. Format the chat log for the AI to read
        const conversationText = fullThread.messages
          .map(m => `${m.senderType.toUpperCase()}: ${m.contentText}`)
          .join('\n');

        // 3. Ask OpenAI to extract a summary and a tag
        const aiResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { 
              role: "system", 
              content: `You are an AI assistant for a clothing brand like Consonant. 
              Read the following customer service transcript. 
              Provide a 1-sentence summary of the customer's core issue.
              Also provide a 1-to-2 word category tag (e.g., 'Returns', 'Sizing', 'Shipping Delay', 'Product Inquiry').
              You must respond ONLY in strict JSON format like this: {"summary": "...", "tag": "..."}` 
            },
            { role: "user", content: conversationText }
          ],
          response_format: { type: "json_object" } 
        });

        // 4. Parse the AI's response
        const aiData = JSON.parse(aiResponse.choices[0].message.content);

        // 5. Save the intelligence back to the thread in PostgreSQL
        await db.thread.update({
          where: { id: threadId },
          data: {
            aiSummary: aiData.summary,
            tag: aiData.tag
          }
        });

        console.log(`[Worker] AI Summary saved: [${aiData.tag}] ${aiData.summary}`);

      } catch (aiError) {
        console.error("[Worker] Failed to generate AI summary:", aiError);
      }
      // -----------------------------------

      console.log(`[Worker] Successfully saved message from ${senderId} to database!`);

    } catch (error) {
      console.error(`[Worker] Database operation failed:`, error);
      throw error; 
    }
  }
}, { connection: redisConnection });

messageWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed permanently:`, err.message);
});

console.log('[Worker] Engine started. Listening for incoming messages...');