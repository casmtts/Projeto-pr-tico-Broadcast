import type { Firestore, Timestamp } from 'firebase-admin/firestore';
import { chunk } from '../helpers/batches.js';

export const processDueScheduledMessages = async (
  db: Firestore,
  cutoff: Timestamp,
  sentAt: Timestamp,
) => {
  const snapshot = await db
    .collection('messages')
    .where('status', '==', 'agendada')
    .where('scheduledAt', '<=', cutoff)
    .limit(500)
    .get();

  if (snapshot.empty) {
    return 0;
  }

  await Promise.all(
    chunk(snapshot.docs, 450).map(async (docs) => {
      const batch = db.batch();
      docs.forEach((message) => {
        batch.update(message.ref, {
          status: 'enviada',
          sentAt,
        });
      });
      await batch.commit();
    }),
  );

  return snapshot.size;
};
