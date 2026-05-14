import { Timestamp } from 'firebase-admin/firestore';

export const scheduledCutoff = (date = new Date()) => Timestamp.fromMillis(date.getTime() + 30_000);
