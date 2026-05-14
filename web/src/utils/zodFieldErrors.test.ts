import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { zodFieldErrors } from './zodFieldErrors';

describe('zodFieldErrors', () => {
  it('retorna a primeira mensagem por chave de primeiro nível', () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(1),
    });
    const r = schema.safeParse({ email: '', password: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const fields = zodFieldErrors(r.error);
      expect(fields.email).toBeDefined();
      expect(fields.password).toBeDefined();
    }
  });
});
