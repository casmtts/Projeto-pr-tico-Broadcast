import { FirebaseError } from 'firebase/app';

function authErrorCode(caught: unknown): string | undefined {
  if (caught instanceof FirebaseError && typeof caught.code === 'string') {
    return caught.code;
  }
  if (caught instanceof Error) {
    const match = caught.message.match(/auth\/[a-z0-9-]+/i);
    return match?.[0];
  }
  return undefined;
}

/** Mensagem curta para a página de login (sem texto bruto do Firebase). */
export function messageForAuthFailure(caught: unknown): string {
  const code = authErrorCode(caught);
  if (code === 'auth/invalid-credential') {
    return 'Invalid credential.';
  }
  if (code?.startsWith('auth/')) {
    return 'Erro de autenticação.';
  }
  return 'Falha na autenticação.';
}
