import { describe, expect, it } from 'vitest';
import {
  addToQueue,
  checkUserConcurrencyLimit,
  removeFromQueue,
  type QueueEntry,
} from '@/lib/analysis/queue';

describe('analysis queue', () => {
  it('counts user waiting tasks without recursion overflow', async () => {
    const entry: QueueEntry = {
      id: 900001,
      userId: 'u-recursion-test',
      status: 'pending',
      isQueued: true,
      queuePosition: 1,
      estimatedWaitTime: 30,
      createdAt: new Date(),
      queuedAt: new Date(),
    };

    addToQueue(entry);

    try {
      const result = await checkUserConcurrencyLimit('u-recursion-test', 'free');

      expect(result.canProcess).toBe(false);
      expect(result.queuePosition).toBe(2);
      expect(typeof result.estimatedWaitTime).toBe('number');
    } finally {
      removeFromQueue(entry.id);
    }
  });
});
