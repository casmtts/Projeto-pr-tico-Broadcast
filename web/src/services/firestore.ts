import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type OrderByDirection,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { AppUser, Connection, Contact, Message, MessageStatus } from '../types/domain';

const withId = <T>(snapshot: DocumentData): T => ({ id: snapshot.id, ...snapshot.data() }) as T;

const normalizeName = (value: string) =>
  value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');

const listenCollection = <T>(
  collectionName: string,
  constraints: QueryConstraint[],
  onChange: (items: T[]) => void,
) =>
  onSnapshot(query(collection(db, collectionName), ...constraints), (snapshot) =>
    onChange(snapshot.docs.map(withId<T>)),
  );

const assertUniqueConnectionName = async (userId: string, nome: string, ignoreId?: string) => {
  const snapshot = await getDocs(
    query(collection(db, 'connections'), where('userId', '==', userId)),
  );
  const normalizedName = normalizeName(nome);
  const hasDuplicate = snapshot.docs.some((document) => {
    const connection = withId<Connection>(document);
    return connection.id !== ignoreId && normalizeName(connection.nome) === normalizedName;
  });

  if (hasDuplicate) {
    throw new Error('Já existe uma conexão com esse nome.');
  }
};

const assertUniqueContactName = async (
  userId: string,
  connectionId: string,
  nome: string,
  ignoreId?: string,
) => {
  const snapshot = await getDocs(
    query(
      collection(db, 'contacts'),
      where('userId', '==', userId),
      where('connectionId', '==', connectionId),
    ),
  );
  const normalizedName = normalizeName(nome);
  const hasDuplicate = snapshot.docs.some((document) => {
    const contact = withId<Contact>(document);
    return contact.id !== ignoreId && normalizeName(contact.nome) === normalizedName;
  });

  if (hasDuplicate) {
    throw new Error('Já existe um contato com esse nome.');
  }
};

export const upsertUser = (user: Pick<AppUser, 'uid' | 'email' | 'nome'>) =>
  setDoc(
    doc(db, 'users', user.uid),
    {
      uid: user.uid,
      email: user.email,
      nome: user.nome,
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );

export const listenConnections = (
  userId: string,
  sortDirection: OrderByDirection,
  onChange: (items: Connection[]) => void,
) =>
  listenCollection<Connection>(
    'connections',
    [where('userId', '==', userId), orderBy('createdAt', sortDirection)],
    onChange,
  );

export const createConnection = async (userId: string, nome: string) => {
  await assertUniqueConnectionName(userId, nome);
  const connectionRef = doc(collection(db, 'connections'));

  await setDoc(connectionRef, {
    id: connectionRef.id,
    userId,
    nome: nome.trim(),
    createdAt: serverTimestamp(),
  });

  return connectionRef;
};

export const updateConnection = async (userId: string, id: string, nome: string) => {
  await assertUniqueConnectionName(userId, nome, id);

  return updateDoc(doc(db, 'connections', id), { nome: nome.trim() });
};

export const deleteConnection = (id: string) => deleteDoc(doc(db, 'connections', id));

export const listenContacts = (
  userId: string,
  connectionId: string,
  onChange: (items: Contact[]) => void,
) =>
  listenCollection<Contact>(
    'contacts',
    [
      where('userId', '==', userId),
      where('connectionId', '==', connectionId),
      orderBy('createdAt', 'desc'),
    ],
    onChange,
  );

export const createContact = async (
  userId: string,
  connectionId: string,
  data: Pick<Contact, 'nome' | 'telefone'>,
) => {
  await assertUniqueContactName(userId, connectionId, data.nome);
  const contactRef = doc(collection(db, 'contacts'));

  await setDoc(contactRef, {
    id: contactRef.id,
    userId,
    connectionId,
    nome: data.nome.trim(),
    telefone: data.telefone.trim(),
    createdAt: serverTimestamp(),
  });

  return contactRef;
};

export const updateContact = async (
  userId: string,
  connectionId: string,
  id: string,
  data: Pick<Contact, 'nome' | 'telefone'>,
) => {
  await assertUniqueContactName(userId, connectionId, data.nome, id);

  return updateDoc(doc(db, 'contacts', id), {
    nome: data.nome.trim(),
    telefone: data.telefone.trim(),
  });
};

export const deleteContact = (id: string) => deleteDoc(doc(db, 'contacts', id));

export const listenMessages = (
  userId: string,
  connectionId: string,
  status: MessageStatus | 'all',
  onChange: (items: Message[]) => void,
) => {
  const constraints: QueryConstraint[] = [
    where('userId', '==', userId),
    where('connectionId', '==', connectionId),
    orderBy('createdAt', 'desc'),
  ];

  if (status !== 'all') {
    constraints.splice(2, 0, where('status', '==', status));
  }

  return listenCollection<Message>('messages', constraints, onChange);
};

export type MessageInput = {
  mensagem: string;
  contatosIds: string[];
  scheduledAt?: Date | null;
};

export const createMessage = (userId: string, connectionId: string, input: MessageInput) => {
  const messageRef = doc(collection(db, 'messages'));
  const scheduledAt = input.scheduledAt ? Timestamp.fromDate(input.scheduledAt) : null;
  const shouldSendNow = !scheduledAt || scheduledAt.toMillis() <= Date.now();

  return setDoc(messageRef, {
    id: messageRef.id,
    userId,
    connectionId,
    contatosIds: input.contatosIds,
    mensagem: input.mensagem.trim(),
    status: shouldSendNow ? 'enviada' : 'agendada',
    scheduledAt: shouldSendNow ? null : scheduledAt,
    sentAt: shouldSendNow ? serverTimestamp() : null,
    createdAt: serverTimestamp(),
  }).then(() => messageRef);
};

export const updateMessage = (id: string, input: MessageInput) => {
  const scheduledAt = input.scheduledAt ? Timestamp.fromDate(input.scheduledAt) : null;
  const shouldSendNow = !scheduledAt || scheduledAt.toMillis() <= Date.now();

  return updateDoc(doc(db, 'messages', id), {
    contatosIds: input.contatosIds,
    mensagem: input.mensagem.trim(),
    status: shouldSendNow ? 'enviada' : 'agendada',
    scheduledAt: shouldSendNow ? null : scheduledAt,
    sentAt: shouldSendNow ? serverTimestamp() : null,
  });
};

export const deleteMessage = (id: string) => deleteDoc(doc(db, 'messages', id));

export const markDueScheduledMessagesAsSent = async (userId: string, connectionId: string) => {
  const now = Timestamp.now();
  const snapshot = await getDocs(
    query(
      collection(db, 'messages'),
      where('userId', '==', userId),
      where('connectionId', '==', connectionId),
      where('status', '==', 'agendada'),
      where('scheduledAt', '<=', now),
    ),
  );

  await Promise.all(
    snapshot.docs.map((message) =>
      updateDoc(message.ref, {
        status: 'enviada',
        sentAt: serverTimestamp(),
      }),
    ),
  );
};
