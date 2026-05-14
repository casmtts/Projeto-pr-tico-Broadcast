import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from './forms';

describe('loginSchema', () => {
  it('rejects empty email', () => {
    const r = loginSchema.safeParse({ email: '', password: 'secret' });
    expect(r.success).toBe(false);
  });

  it('rejects empty password', () => {
    const r = loginSchema.safeParse({ email: 'a@b.com', password: '' });
    expect(r.success).toBe(false);
  });

  it('rejects invalid email format', () => {
    const r = loginSchema.safeParse({ email: 'not-an-email', password: 'secret' });
    expect(r.success).toBe(false);
  });

  it('accepts valid credentials', () => {
    const r = loginSchema.safeParse({ email: 'a@b.com', password: 'secret' });
    expect(r.success).toBe(true);
  });
});

describe('registerSchema', () => {
  it('rejects missing name', () => {
    const r = registerSchema.safeParse({ email: 'a@b.com', password: 'x', name: '' });
    expect(r.success).toBe(false);
  });

  it('rejects invalid email on register', () => {
    const r = registerSchema.safeParse({
      name: 'Maria',
      email: 'invalid',
      password: '123456',
    });
    expect(r.success).toBe(false);
  });

  it('accepts register payload', () => {
    const r = registerSchema.safeParse({
      name: 'Maria',
      email: 'maria@example.com',
      password: '123456',
    });
    expect(r.success).toBe(true);
  });
});
