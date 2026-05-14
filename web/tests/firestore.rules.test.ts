/** @vitest-environment node */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import type { RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const dir = dirname(fileURLToPath(import.meta.url));
const rules = readFileSync(join(dir, '../../firestore.rules'), 'utf8');

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-broadcast-rules',
    firestore: { rules },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('Firestore security rules', () => {
  it('denies message reads without authentication', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(db.collection('messages').doc('m1').get());
  });

  it('allows owner to read own message and blocks other tenant', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      const db = admin.firestore();
      await db
        .collection('messages')
        .doc('m1')
        .set({
          id: 'm1',
          userId: 'user-a',
          connectionId: 'conn-1',
          contatosIds: ['c1'],
          mensagem: 'Olá',
          status: 'agendada',
          scheduledAt: null,
          sentAt: null,
          createdAt: firebase.firestore.Timestamp.now(),
        });
    });

    const ownerDb = testEnv.authenticatedContext('user-a').firestore();
    await assertSucceeds(ownerDb.collection('messages').doc('m1').get());

    const otherDb = testEnv.authenticatedContext('user-b').firestore();
    await assertFails(otherDb.collection('messages').doc('m1').get());
  });

  it('blocks update on sent message after 15 minute window', async () => {
    const oldSent = new Date(Date.now() - 20 * 60 * 1000);
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      const db = admin.firestore();
      await db
        .collection('messages')
        .doc('m2')
        .set({
          id: 'm2',
          userId: 'owner',
          connectionId: 'conn-1',
          contatosIds: ['c1'],
          mensagem: 'Enviada',
          status: 'enviada',
          scheduledAt: null,
          sentAt: firebase.firestore.Timestamp.fromDate(oldSent),
          createdAt: firebase.firestore.Timestamp.now(),
        });
    });

    const db = testEnv.authenticatedContext('owner').firestore();
    await assertFails(
      db.collection('messages').doc('m2').update({
        mensagem: 'Alterada',
      }),
    );
  });

  it('allows owner to read own contact and blocks other tenant', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      const db = admin.firestore();
      await db
        .collection('contacts')
        .doc('c1')
        .set({
          id: 'c1',
          userId: 'user-a',
          connectionId: 'conn-1',
          nome: 'João',
          telefone: '11987654321',
          createdAt: firebase.firestore.Timestamp.now(),
        });
    });

    const ownerDb = testEnv.authenticatedContext('user-a').firestore();
    await assertSucceeds(ownerDb.collection('contacts').doc('c1').get());

    const otherDb = testEnv.authenticatedContext('user-b').firestore();
    await assertFails(otherDb.collection('contacts').doc('c1').get());
  });

  it('denies create connection when userId does not match auth uid', async () => {
    const db = testEnv.authenticatedContext('user-a').firestore();
    await assertFails(
      db.collection('connections').doc('conn-spoof').set({
        id: 'conn-spoof',
        userId: 'user-b',
        nome: 'Conexão inválida',
        createdAt: firebase.firestore.Timestamp.now(),
      }),
    );
  });

  it('denies create contact when userId does not match auth uid', async () => {
    const db = testEnv.authenticatedContext('user-a').firestore();
    await assertFails(
      db.collection('contacts').doc('c-spoof').set({
        id: 'c-spoof',
        userId: 'user-b',
        connectionId: 'conn-1',
        nome: 'Contato',
        telefone: '11987654321',
        createdAt: firebase.firestore.Timestamp.now(),
      }),
    );
  });

  it('denies create message when userId does not match auth uid', async () => {
    const db = testEnv.authenticatedContext('user-a').firestore();
    await assertFails(
      db.collection('messages').doc('m-spoof').set({
        id: 'm-spoof',
        userId: 'user-b',
        connectionId: 'conn-1',
        contatosIds: ['c1'],
        mensagem: 'Olá',
        status: 'agendada',
        scheduledAt: null,
        sentAt: null,
        createdAt: firebase.firestore.Timestamp.now(),
      }),
    );
  });

  it('denies create user profile document for another uid path', async () => {
    const db = testEnv.authenticatedContext('user-a').firestore();
    await assertFails(
      db.collection('users').doc('user-b').set({
        uid: 'user-b',
        nome: 'Vitima',
        email: 'v@example.com',
        createdAt: firebase.firestore.Timestamp.now(),
      }),
    );
  });
});
