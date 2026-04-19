import { Queue } from 'bullmq';
import { QUEUE } from './constants.js';
export const WORKER_HEARTBEAT_KEY = 'health:gateway-worker:heartbeat';
export const WORKER_HEARTBEAT_INTERVAL_MS = 15_000;
export const WORKER_HEARTBEAT_TTL_SECS = 60;
export const WORKER_HEARTBEAT_STALE_MS = 45_000;
export async function writeWorkerHeartbeat(redis) {
    const payload = {
        timestamp: new Date().toISOString(),
        pid: process.pid,
    };
    await redis.set(WORKER_HEARTBEAT_KEY, JSON.stringify(payload), 'EX', WORKER_HEARTBEAT_TTL_SECS);
}
export async function readWorkerHeartbeat(redis) {
    const raw = await redis.get(WORKER_HEARTBEAT_KEY);
    if (!raw) {
        return { healthy: false, ageMs: null, payload: null };
    }
    try {
        const payload = JSON.parse(raw);
        const ageMs = Date.now() - new Date(payload.timestamp).getTime();
        return {
            healthy: ageMs <= WORKER_HEARTBEAT_STALE_MS,
            ageMs,
            payload,
        };
    }
    catch {
        return { healthy: false, ageMs: null, payload: null };
    }
}
export async function getQueueDiagnostics(redis) {
    const connection = redis;
    const inboundQueue = new Queue(QUEUE.INBOUND, { connection });
    const summaryQueue = new Queue(QUEUE.AI_SUMMARY, { connection });
    try {
        const [inboundCounts, summaryCounts] = await Promise.all([
            inboundQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed', 'paused'),
            summaryQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed', 'paused'),
        ]);
        return {
            inbound: inboundCounts,
            aiSummary: summaryCounts,
        };
    }
    finally {
        await Promise.all([inboundQueue.close(), summaryQueue.close()]);
    }
}
