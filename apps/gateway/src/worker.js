import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { db } from '@clerk/db'; 
import dotenv from 'dotenv';

dotenv.config();

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
    // Note: Meta sends arrays because they batch events. For the MVP, we grab the first one.
    const messagingEvent = rawPayload.entry[0]?.messaging[0];
    if (!messagingEvent || !messagingEvent.message || !messagingEvent.message.text) {
      // If it's just a read receipt or typing indicator, we ignore it
      return; 
    }

    const senderId = messagingEvent.sender.id; // The customer's IG-Scoped ID
    const messageText = messagingEvent.message.text;

    try {
      // 2. Find or Create the Customer in PostgreSQL
      // 'upsert' means "update if they exist, insert if they don't"
      const customer = await db.customer.upsert({
        where: { platformId: senderId },
        update: {}, // We don't need to update anything if they already exist
        create: {
          platformId: senderId,
          // We leave the name null for now. Grabbing their IG handle requires 
          // a separate Meta Graph API call which you can add later.
        }
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

      console.log(`[Worker] Successfully saved message from ${senderId} to database!`);

    } catch (error) {
      console.error(`[Worker] Database operation failed:`, error);
      // Throwing the error tells BullMQ to put the job back in the queue and try again later
      throw error; 
    }
  }
}, { connection: redisConnection });

// Graceful error handling for the worker instance itself
messageWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed permanently:`, err.message);
});

console.log('[Worker] Engine started. Listening for incoming messages...');