import { Timestamp } from 'firebase/firestore';
import { describe, expect, it } from 'vitest';
import { canDeleteMessage, canEditMessage } from './messageDeletion';
import type { Message } from '../types/domain';

const message = (sentAt: Date): Message =>
  ({
    status: 'enviada',
    sentAt: Timestamp.fromDate(sentAt),
  }) as Message;

describe('canDeleteMessage', () => {
  it('allows deleting sent messages within 15 minutes of sending', () => {
    expect(
      canDeleteMessage(message(new Date('2026-05-13T10:00:00Z')), new Date('2026-05-13T10:14:59Z')),
    ).toBe(true);
  });

  it('allows deleting at exactly 15 minutes after sending', () => {
    expect(
      canDeleteMessage(message(new Date('2026-05-13T10:00:00Z')), new Date('2026-05-13T10:15:00Z')),
    ).toBe(true);
  });

  it('blocks deleting sent messages after the 15-minute window', () => {
    expect(
      canDeleteMessage(
        message(new Date('2026-05-13T10:00:00Z')),
        new Date('2026-05-13T10:15:00.001Z'),
      ),
    ).toBe(false);
  });
});

describe('canEditMessage', () => {
  it('matches delete window for sent messages', () => {
    const m = message(new Date('2026-05-13T10:00:00Z'));
    const t1 = new Date('2026-05-13T10:10:00Z');
    const t2 = new Date('2026-05-13T10:20:00Z');
    expect(canEditMessage(m, t1)).toBe(canDeleteMessage(m, t1));
    expect(canEditMessage(m, t2)).toBe(canDeleteMessage(m, t2));
  });
});
