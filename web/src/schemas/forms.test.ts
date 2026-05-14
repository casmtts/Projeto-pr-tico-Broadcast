import { describe, expect, it } from 'vitest';
import { validateMessageForm, validateMessageSubmit } from './forms';

describe('validateMessageSubmit', () => {
  it('rejects empty contacts', () => {
    const r = validateMessageSubmit({
      mensagem: 'Olá',
      contatosIds: [],
      deliveryMode: 'now',
      scheduledAt: '',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/contato/i);
  });

  it('accepts send now', () => {
    const r = validateMessageSubmit({
      mensagem: 'Teste',
      contatosIds: ['c1'],
      deliveryMode: 'now',
      scheduledAt: '',
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.scheduledAt).toBeNull();
  });

  it('rejects schedule mode without datetime', () => {
    const r = validateMessageSubmit({
      mensagem: 'Olá',
      contatosIds: ['c1'],
      deliveryMode: 'schedule',
      scheduledAt: '',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/agendamento|horário/i);
  });

  it('rejects past scheduled datetime', () => {
    const r = validateMessageSubmit({
      mensagem: 'Olá',
      contatosIds: ['c1'],
      deliveryMode: 'schedule',
      scheduledAt: '2000-01-01T08:00',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/futuro|atual/i);
  });
});

describe('validateMessageForm', () => {
  it('returns field errors for empty message and contacts', () => {
    const r = validateMessageForm({
      mensagem: '   ',
      contatosIds: [],
      deliveryMode: 'now',
      scheduledAt: '',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.fields.mensagem).toBeDefined();
      expect(r.fields.contatosIds).toBeDefined();
    }
  });

  it('returns scheduledAt field error for past schedule', () => {
    const r = validateMessageForm({
      mensagem: 'Olá',
      contatosIds: ['c1'],
      deliveryMode: 'schedule',
      scheduledAt: '2000-01-01T08:00',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.fields.scheduledAt).toMatch(/futuro|atual/i);
  });
});
