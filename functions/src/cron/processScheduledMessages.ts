import { Timestamp } from 'firebase-admin/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { scheduledCutoff } from '../helpers/schedule.js';
import { db } from '../index.js';
import { processDueScheduledMessages } from '../services/messages.js';

export const processScheduledMessages = onSchedule(
  {
    schedule: '* * * * *',
    timeZone: 'America/Belem',
    region: 'southamerica-east1',
    memory: '256MiB',
  },
  async () => {
    const now = Timestamp.now();
    await processDueScheduledMessages(db, scheduledCutoff(now.toDate()), now);
  },
);
