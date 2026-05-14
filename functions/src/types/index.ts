import type { Timestamp } from 'firebase-admin/firestore';

export type MessageStatus = 'agendada' | 'enviada';

export type MessageData = {
  userId: string;
  connectionId: string;
  contatosIds: string[];
  mensagem: string;
  status: MessageStatus;
  scheduledAt: Timestamp | null;
  sentAt: Timestamp | null;
  createdAt: Timestamp;
};
