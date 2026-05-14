import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Drawer,
  IconButton,
  Snackbar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { AppShell } from '@/components/layout/AppShell';
import { Sidebar } from '@/components/layout/Sidebar';
import { ConnectionWorkspace } from '@/components/dashboard/ConnectionWorkspace';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { ContactDialog } from '@/components/dialogs/ContactDialog';
import { MessageDialog } from '@/components/dialogs/MessageDialog';
import { NameDialog } from '@/components/dialogs/NameDialog';
import { useAuth, consumeRegistrationSuccessToast } from '@/contexts/AuthContext';
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';
import { useScheduledMessagesSync } from '@/hooks/useScheduledMessagesSync';
import { useToastStore } from '@/stores/toastStore';
import {
  createConnection,
  createContact,
  createMessage,
  deleteConnection,
  deleteContact,
  deleteMessage,
  listenConnections,
  listenContacts,
  listenMessages,
  updateConnection,
  updateContact,
  updateMessage,
} from '@/services/firestore';
import type { ConfirmState } from '@/types/confirm';
import type { Connection, Contact, Message, MessageStatus } from '@/types/domain';

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const toastMessage = useToastStore((s) => s.message);
  const hideToast = useToastStore((s) => s.hide);
  const showToast = useToastStore((s) => s.show);
  const userId = user?.uid ?? '';
  const [selectedConnectionId, setSelectedConnectionId] = useState('');
  const [tab, setTab] = useState(0);
  const [messageFilter, setMessageFilter] = useState<MessageStatus | 'all'>('all');
  const [connectionSort, setConnectionSort] = useState<'asc' | 'desc'>('desc');
  const [connectionDialog, setConnectionDialog] = useState<Connection | 'new' | null>(null);
  const [contactDialog, setContactDialog] = useState<Contact | 'new' | null>(null);
  const [messageDialog, setMessageDialog] = useState<Message | 'new' | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const theme = useTheme();
  const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));

  const connectionListener = useMemo(
    () =>
      userId
        ? (onChange: (items: Connection[]) => void) =>
            listenConnections(userId, connectionSort, onChange)
        : null,
    [userId, connectionSort],
  );
  const { items: connections, loading: connectionsLoading } =
    useRealtimeCollection(connectionListener);
  const selectedConnection =
    connections.find((connection) => connection.id === selectedConnectionId) ?? connections[0];
  const activeConnectionId = selectedConnection?.id ?? '';

  const contactListener = useMemo(
    () =>
      userId && activeConnectionId
        ? (onChange: (items: Contact[]) => void) =>
            listenContacts(userId, activeConnectionId, onChange)
        : null,
    [activeConnectionId, userId],
  );
  const { items: contacts, loading: contactsLoading } = useRealtimeCollection(contactListener);

  const messageListener = useMemo(
    () =>
      userId && activeConnectionId
        ? (onChange: (items: Message[]) => void) =>
            listenMessages(userId, activeConnectionId, messageFilter, onChange)
        : null,
    [activeConnectionId, userId, messageFilter],
  );
  const { items: messages, loading: messagesLoading } = useRealtimeCollection(messageListener);

  useScheduledMessagesSync(userId, activeConnectionId);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (consumeRegistrationSuccessToast()) {
        useToastStore.getState().show('Conta criada com sucesso!');
      }
    }, 150);
    return () => window.clearTimeout(id);
  }, []);

  const sidebarProps = {
    connections,
    loading: connectionsLoading,
    sortDirection: connectionSort,
    selectedConnectionId: activeConnectionId,
    onSortToggle: () =>
      setConnectionSort((current) => (current === 'desc' ? 'asc' : 'desc')),
    onAddConnection: () => setConnectionDialog('new'),
    onSelectConnection: (id: string) => {
      setSelectedConnectionId(id);
      setMobileNavOpen(false);
    },
    onEditConnection: (connection: Connection) => setConnectionDialog(connection),
    onDeleteConnection: (connection: Connection) =>
      setConfirm({
        title: 'Excluir conexão',
        description: `Deseja excluir a conexão "${connection.nome}"?`,
        onConfirm: async () => {
          await deleteConnection(connection.id);
          showToast('Conexão excluída.');
        },
      }),
  };

  return (
    <AppShell
      userEmail={user?.email}
      onLogout={logout}
      leadingToolbar={
        !isLgUp ? (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="Abrir lista de conexões"
            onClick={() => setMobileNavOpen(true)}
            size="medium"
          >
            <MenuIcon />
          </IconButton>
        ) : undefined
      }
    >
      <Container maxWidth="xl" className="py-4 px-3 sm:py-6 sm:px-4">
        <Box className="grid gap-4 lg:grid-cols-[320px_1fr]">
          {isLgUp && <Sidebar {...sidebarProps} />}

          <ConnectionWorkspace
            connectionName={activeConnectionId ? selectedConnection?.nome : undefined}
            tab={tab}
            onTabChange={setTab}
            contacts={contacts}
            contactsLoading={contactsLoading}
            onAddContact={() => setContactDialog('new')}
            onEditContact={(contact) => setContactDialog(contact)}
            onRequestDeleteContact={(contact) =>
              setConfirm({
                title: 'Excluir contato',
                description: `Deseja excluir o contato "${contact.nome}"?`,
                onConfirm: async () => {
                  await deleteContact(contact.id);
                  showToast('Contato excluído.');
                },
              })
            }
            messages={messages}
            messagesLoading={messagesLoading}
            messageFilter={messageFilter}
            onMessageFilterChange={setMessageFilter}
            onNewMessage={() => setMessageDialog('new')}
            onEditMessage={(message) => setMessageDialog(message)}
            onRequestDeleteMessage={(message) =>
              setConfirm({
                title: 'Excluir mensagem',
                description: 'Deseja excluir esta mensagem?',
                onConfirm: async () => {
                  await deleteMessage(message.id);
                  showToast('Mensagem excluída.');
                },
              })
            }
            onCreateFirstConnection={() => setConnectionDialog('new')}
          />
        </Box>
      </Container>

      {!isLgUp && (
        <Drawer
          anchor="left"
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          ModalProps={{ keepMounted: true }}
        >
          <Box className="w-[min(100vw-48px,320px)] p-2">
            <Sidebar {...sidebarProps} />
          </Box>
        </Drawer>
      )}

      {connectionDialog && (
        <NameDialog
          title={connectionDialog === 'new' ? 'Nova conexão' : 'Editar conexão'}
          initialValue={connectionDialog === 'new' ? '' : connectionDialog.nome}
          onClose={() => setConnectionDialog(null)}
          onSubmit={(name) =>
            connectionDialog === 'new'
              ? createConnection(userId, name).then((docRef) => {
                  setSelectedConnectionId(docRef.id);
                  showToast('Conexão criada.');
                })
              : updateConnection(userId, connectionDialog.id, name).then(() =>
                  showToast('Conexão atualizada.'),
                )
          }
        />
      )}
      {contactDialog && (
        <ContactDialog
          contact={contactDialog === 'new' ? undefined : contactDialog}
          onClose={() => setContactDialog(null)}
          onSubmit={(data) =>
            contactDialog === 'new'
              ? createContact(userId, activeConnectionId, data).then(() =>
                  showToast('Contato criado.'),
                )
              : updateContact(userId, activeConnectionId, contactDialog.id, data).then(() =>
                  showToast('Contato atualizado.'),
                )
          }
        />
      )}
      {messageDialog && (
        <MessageDialog
          contacts={contacts}
          message={messageDialog === 'new' ? undefined : messageDialog}
          onClose={() => setMessageDialog(null)}
          onSubmit={(input) =>
            messageDialog === 'new'
              ? createMessage(userId, activeConnectionId, input).then(() =>
                  showToast('Mensagem salva.'),
                )
              : updateMessage(messageDialog.id, input).then(() => showToast('Mensagem atualizada.'))
          }
        />
      )}
      <ConfirmDialog confirm={confirm} onClose={() => setConfirm(null)} />
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={(theme) => ({
          top: theme.spacing(9),
          right: theme.spacing(2),
        })}
        message={toastMessage}
        onClose={() => hideToast()}
      />
    </AppShell>
  );
};
