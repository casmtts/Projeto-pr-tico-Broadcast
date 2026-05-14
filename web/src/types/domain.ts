import type { Timestamp } from 'firebase/firestore';

export type MessageStatus = 'agendada' | 'enviada';

export type AppUser = {
  id: string;
  uid: string;
  nome: string;
  email: string;
  createdAt: Timestamp;
};

export type Connection = {
  id: string;
  userId: string;
  nome: string;
  createdAt: Timestamp;
};

export type Contact = {
  id: string;
  userId: string;
  connectionId: string;
  nome: string;
  telefone: string;
  createdAt: Timestamp;
};

export type Message = {
  id: string;
  userId: string;
  connectionId: string;
  contatosIds: string[];
  mensagem: string;
  status: MessageStatus;
  scheduledAt: Timestamp | null;
  sentAt: Timestamp | null;
  createdAt: Timestamp;
};
