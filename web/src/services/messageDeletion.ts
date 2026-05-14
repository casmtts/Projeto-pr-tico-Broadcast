import type { Message } from '../types/domain';

/** Janela após envio em que edição e exclusão ainda são permitidas. */
export const sentMessageModifyWindowMs = 15 * 60 * 1000;

const canModifySentMessage = (message: Message, now = new Date()) => {
  if (message.status !== 'enviada' || !message.sentAt) {
    return true;
  }

  const elapsedMs = now.getTime() - message.sentAt.toDate().getTime();
  return elapsedMs <= sentMessageModifyWindowMs;
};

export const canDeleteMessage = (message: Message, now = new Date()) =>
  canModifySentMessage(message, now);

export const canEditMessage = (message: Message, now = new Date()) =>
  canModifySentMessage(message, now);
