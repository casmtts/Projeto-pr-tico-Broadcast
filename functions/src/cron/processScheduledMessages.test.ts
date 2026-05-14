import { describe, expect, it } from 'vitest';
import { chunk } from '../helpers/batches.js';
import { scheduledCutoff } from '../helpers/schedule.js';

describe('chunk', () => {
  it('splits items into fixed-size groups', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('uses a small future cutoff for exact-minute schedules', () => {
    expect(scheduledCutoff(new Date('2026-05-13T10:00:00.000Z')).toDate().toISOString()).toBe(
      '2026-05-13T10:00:30.000Z',
    );
  });
});
