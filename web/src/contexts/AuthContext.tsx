import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { upsertUser } from '../services/firestore';

const REGISTRATION_SUCCESS_SESSION = 'broadcast_registration_success';
const REGISTRATION_TOAST_MAX_AGE_MS = 120_000;

let registrationToastPending = false;

/** Lê e limpa o flag de “conta criada”; só é verdadeiro se o registo foi há poucos segundos. */
export function consumeRegistrationSuccessToast(): boolean {
  if (registrationToastPending) {
    registrationToastPending = false;
    try {
      sessionStorage.removeItem(REGISTRATION_SUCCESS_SESSION);
    } catch {
      // ignorar
    }
    return true;
  }
  try {
    const raw = sessionStorage.getItem(REGISTRATION_SUCCESS_SESSION);
    if (!raw) {
      return false;
    }
    sessionStorage.removeItem(REGISTRATION_SUCCESS_SESSION);
    const data = JSON.parse(raw) as { at: number };
    if (typeof data.at !== 'number' || Number.isNaN(data.at)) {
      return false;
    }
    return Date.now() - data.at <= REGISTRATION_TOAST_MAX_AGE_MS;
  } catch {
    return false;
  }
}

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        setLoading(false);

        if (currentUser) {
          await upsertUser({
            uid: currentUser.uid,
            email: currentUser.email ?? '',
            nome: currentUser.displayName ?? currentUser.email ?? 'Cliente',
          });
        }
      }),
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
      },
      register: async (name, email, password) => {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName: name });
        await upsertUser({ uid: credential.user.uid, email, nome: name });
        registrationToastPending = true;
        try {
          sessionStorage.setItem(
            REGISTRATION_SUCCESS_SESSION,
            JSON.stringify({ at: Date.now() }),
          );
        } catch {
          // ignorar se sessionStorage não estiver disponível
        }
      },
      logout: () => signOut(auth),
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return value;
};
