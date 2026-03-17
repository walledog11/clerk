import express from 'express';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const router = express.Router();

// 1. Connect to your local Redis instance
const redisConnection = new IORedis(process.env.REDIS_URL);

// 2. Initialize the BullMQ Queue
// This is the conveyor belt that will hold incoming messages
const messageQueue = new Queue('inbound-messages', { connection: redisConnection });

// -----------------------------------------------------------------------------
// GET: Meta Verification Handshake
// -----------------------------------------------------------------------------
router.get('/meta', (req, res) => {
  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN; 
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[Webhook] Meta handshake successful!');
      return res.status(200).send(challenge);
    } else {
      console.error('[Webhook] Meta handshake failed: Token mismatch.');
      return res.sendStatus(403);
    }
  }
  return res.sendStatus(400);
});

// -----------------------------------------------------------------------------
// POST: Catching Live Instagram DMs
// -----------------------------------------------------------------------------
router.post('/meta', async (req, res) => {
  const payload = req.body;

  // Verify the payload is formatted exactly how Meta sends it
  if (payload.object === 'page' || payload.object === 'instagram') {
    
    try {
      // Throw the raw JSON directly onto the Redis conveyor belt
      await messageQueue.add('process-ig-dm', {
        platform: 'ig_dm',
        rawPayload: payload
      });

      console.log(`[Webhook] Payload received and queued! Job added to Redis.`);
      
      // Immediately return 200 OK so Meta's servers don't time out
      return res.status(200).send('EVENT_RECEIVED');
    } catch (error) {
      console.error('[Webhook] Failed to add job to Redis queue:', error);
      return res.sendStatus(500);
    }
  } else {
    return res.sendStatus(404);
  }
});

export default router;