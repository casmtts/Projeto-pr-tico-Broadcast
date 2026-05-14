import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import { canDeleteMessage, canEditMessage } from '@/services/messageDeletion';
import { formatDateTime } from '@/services/schedule';
import type { Message, MessageStatus } from '@/types/domain';

const messageDateLabel = (message: Message) => {
  if (message.status === 'enviada' && message.sentAt) {
    return `Enviada em ${formatDateTime(message.sentAt.toDate())}`;
  }
  if (message.status === 'agendada' && message.scheduledAt) {
    return `Agendada para ${formatDateTime(message.scheduledAt.toDate())}`;
  }
  return 'Aguardando sincronização';
};

type Props = {
  messages: Message[];
  loading: boolean;
  messageFilter: MessageStatus | 'all';
  onMessageFilterChange: (value: MessageStatus | 'all') => void;
  contactsEmpty: boolean;
  onNewMessage: () => void;
  onEditMessage: (message: Message) => void;
  onRequestDeleteMessage: (message: Message) => void;
};

export const MessagesPanel = ({
  messages,
  loading,
  messageFilter,
  onMessageFilterChange,
  contactsEmpty,
  onNewMessage,
  onEditMessage,
  onRequestDeleteMessage,
}: Props) => (
  <Box className="mt-6">
    <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', gap: 2 }}>
      <Button
        variant="contained"
        startIcon={<SendIcon />}
        disabled={contactsEmpty}
        onClick={onNewMessage}
      >
        Nova mensagem
      </Button>
      <FormControl size="small" className="min-w-48">
        <InputLabel>Status</InputLabel>
        <Select
          label="Status"
          value={messageFilter}
          onChange={(event) => onMessageFilterChange(event.target.value as MessageStatus | 'all')}
        >
          <MenuItem value="all">Todas</MenuItem>
          <MenuItem value="enviada">Enviadas</MenuItem>
          <MenuItem value="agendada">Agendadas</MenuItem>
        </Select>
      </FormControl>
    </Stack>
    <Box className="mt-4 grid gap-3">
      {loading && (
        <Box className="py-8 flex justify-center">
          <CircularProgress size={24} />
        </Box>
      )}
      {!loading && messages.length === 0 && (
        <Typography className="py-8 text-center text-sm text-[#5f6b7a]">
          Nenhuma mensagem encontrada para este filtro.
        </Typography>
      )}
      {messages.map((message) => (
        <Paper key={message.id} variant="outlined" className="p-4">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            sx={{
              justifyContent: 'space-between',
              gap: 2,
              alignItems: { xs: 'stretch', md: 'center' },
            }}
          >
            <Box>
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                <Chip
                  size="small"
                  color={message.status === 'enviada' ? 'success' : 'warning'}
                  label={message.status === 'enviada' ? 'Enviada' : 'Agendada'}
                />
                <Typography className="text-sm text-[#5f6b7a]">
                  {message.contatosIds.length} contato(s)
                </Typography>
              </Stack>
              <Typography className="mt-2 text-sm text-[#5f6b7a]">
                {messageDateLabel(message)}
              </Typography>
              <Typography className="mt-2">{message.mensagem}</Typography>
            </Box>
            <Stack
              direction="row"
              sx={{
                flexShrink: 0,
                alignItems: 'center',
                alignSelf: { xs: 'flex-end', md: 'auto' },
              }}
            >
              <Tooltip
                title={
                  canEditMessage(message)
                    ? 'Editar mensagem'
                    : 'Mensagens enviadas só podem ser editadas até 15 minutos após o envio'
                }
              >
                <span>
                  <IconButton
                    aria-label="Editar mensagem"
                    disabled={!canEditMessage(message)}
                    onClick={() => onEditMessage(message)}
                  >
                    <EditIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip
                title={
                  canDeleteMessage(message)
                    ? 'Excluir mensagem'
                    : 'Mensagens enviadas só podem ser excluídas até 15 minutos após o envio'
                }
              >
                <span>
                  <IconButton
                    aria-label="Excluir mensagem"
                    disabled={!canDeleteMessage(message)}
                    onClick={() => onRequestDeleteMessage(message)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Stack>
        </Paper>
      ))}
    </Box>
  </Box>
);
