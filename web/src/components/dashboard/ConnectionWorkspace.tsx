import { Box, Button, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ContactsPanel } from '@/components/dashboard/ContactsPanel';
import { MessagesPanel } from '@/components/dashboard/MessagesPanel';
import type { Contact, Message, MessageStatus } from '@/types/domain';

type Props = {
  connectionName: string | undefined;
  tab: number;
  onTabChange: (index: number) => void;
  contacts: Contact[];
  contactsLoading: boolean;
  onAddContact: () => void;
  onEditContact: (contact: Contact) => void;
  onRequestDeleteContact: (contact: Contact) => void;
  messages: Message[];
  messagesLoading: boolean;
  messageFilter: MessageStatus | 'all';
  onMessageFilterChange: (value: MessageStatus | 'all') => void;
  onNewMessage: () => void;
  onEditMessage: (message: Message) => void;
  onRequestDeleteMessage: (message: Message) => void;
  onCreateFirstConnection: () => void;
};

export const ConnectionWorkspace = ({
  connectionName,
  tab,
  onTabChange,
  contacts,
  contactsLoading,
  onAddContact,
  onEditContact,
  onRequestDeleteContact,
  messages,
  messagesLoading,
  messageFilter,
  onMessageFilterChange,
  onNewMessage,
  onEditMessage,
  onRequestDeleteMessage,
  onCreateFirstConnection,
}: Props) => (
  <Paper elevation={0} className="p-4 min-h-[620px]">
    {!connectionName ? (
      <Box className="flex h-[520px] items-center justify-center">
        <Button variant="contained" startIcon={<AddIcon />} onClick={onCreateFirstConnection}>
          Criar primeira conexão
        </Button>
      </Box>
    ) : (
      <>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          sx={{ justifyContent: 'space-between', gap: 2 }}
        >
          <Box>
            <Typography variant="h5" className="font-semibold">
              {connectionName}
            </Typography>
            <Typography className="text-[#5f6b7a]">Contatos e mensagens desta conexão.</Typography>
          </Box>
          <Tabs value={tab} onChange={(_, next) => onTabChange(next)}>
            <Tab label="Contatos" />
            <Tab label="Mensagens" />
          </Tabs>
        </Stack>

        {tab === 0 && (
          <ContactsPanel
            contacts={contacts}
            loading={contactsLoading}
            onAdd={onAddContact}
            onEdit={onEditContact}
            onRequestDelete={onRequestDeleteContact}
          />
        )}

        {tab === 1 && (
          <MessagesPanel
            messages={messages}
            loading={messagesLoading}
            messageFilter={messageFilter}
            onMessageFilterChange={onMessageFilterChange}
            contactsEmpty={contacts.length === 0}
            onNewMessage={onNewMessage}
            onEditMessage={onEditMessage}
            onRequestDeleteMessage={onRequestDeleteMessage}
          />
        )}
      </>
    )}
  </Paper>
);
