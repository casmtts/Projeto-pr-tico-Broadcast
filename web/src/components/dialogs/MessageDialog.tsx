import { useState, type FormEvent } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ScheduleIcon from '@mui/icons-material/Schedule';
import {
  validateMessageForm,
  type MessageFormFieldErrors,
} from '@/schemas/forms';
import type { MessageInput } from '@/services/firestore';
import { formatPhoneBr } from '@/services/phone';
import { toDatetimeLocalValue } from '@/services/schedule';
import type { Contact, Message } from '@/types/domain';

type Props = {
  contacts: Contact[];
  message?: Message;
  onClose: () => void;
  onSubmit: (input: MessageInput) => Promise<void>;
};

export const MessageDialog = ({ contacts, message, onClose, onSubmit }: Props) => {
  const initialSchedule = message?.scheduledAt?.toDate();
  const initialMode = initialSchedule ? 'schedule' : 'now';
  const [mensagem, setContent] = useState(message?.mensagem ?? '');
  const [contatosIds, setContactIds] = useState<string[]>(message?.contatosIds ?? []);
  const [deliveryMode, setDeliveryMode] = useState<'now' | 'schedule'>(initialMode);
  const [scheduledAt, setScheduledAt] = useState(
    initialSchedule ? toDatetimeLocalValue(initialSchedule) : '',
  );
  const [fieldErrors, setFieldErrors] = useState<MessageFormFieldErrors>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const minSchedule = toDatetimeLocalValue(new Date());

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setFieldErrors({});
    const result = validateMessageForm({
      mensagem,
      contatosIds,
      deliveryMode,
      scheduledAt,
    });
    if (!result.ok) {
      setFieldErrors(result.fields);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(result.data);
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível salvar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm" scroll="paper">
      <Box component="form" onSubmit={(event) => void handleSubmit(event)}>
        <DialogTitle>{message ? 'Editar mensagem' : 'Nova mensagem'}</DialogTitle>
        <DialogContent className="flex flex-col gap-4 pt-2">
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Mensagem"
            value={mensagem}
            minRows={4}
            multiline
            onChange={(event) => {
              setContent(event.target.value);
              setFieldErrors((prev) => ({ ...prev, mensagem: undefined }));
            }}
            required
            error={Boolean(fieldErrors.mensagem)}
            helperText={fieldErrors.mensagem}
          />
          <FormControl required error={Boolean(fieldErrors.contatosIds)}>
            <InputLabel>Contatos</InputLabel>
            <Select
              multiple
              label="Contatos"
              value={contatosIds}
              renderValue={(selected) => `${selected.length} selecionado(s)`}
              onChange={(event) => {
                setContactIds(event.target.value as string[]);
                setFieldErrors((prev) => ({ ...prev, contatosIds: undefined }));
              }}
            >
              {contacts.map((contact) => (
                <MenuItem key={contact.id} value={contact.id}>
                  <Checkbox checked={contatosIds.includes(contact.id)} />
                  <ListItemText
                    primary={contact.nome}
                    secondary={formatPhoneBr(contact.telefone)}
                  />
                </MenuItem>
              ))}
            </Select>
            {fieldErrors.contatosIds ? (
              <FormHelperText>{fieldErrors.contatosIds}</FormHelperText>
            ) : null}
          </FormControl>
          <ToggleButtonGroup
            exclusive
            fullWidth
            color="primary"
            value={deliveryMode}
            onChange={(_, nextMode: 'now' | 'schedule' | null) => {
              if (nextMode) {
                setDeliveryMode(nextMode);
                setFieldErrors((prev) => ({ ...prev, scheduledAt: undefined }));
              }
            }}
          >
            <ToggleButton value="now">Enviar agora</ToggleButton>
            <ToggleButton value="schedule">Agendar</ToggleButton>
          </ToggleButtonGroup>
          {deliveryMode === 'schedule' && (
            <TextField
              label="Agendar para"
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => {
                setScheduledAt(event.target.value);
                setFieldErrors((prev) => ({ ...prev, scheduledAt: undefined }));
              }}
              required
              error={Boolean(fieldErrors.scheduledAt)}
              helperText={fieldErrors.scheduledAt}
              slotProps={{ htmlInput: { min: minSchedule }, inputLabel: { shrink: true } }}
            />
          )}
        </DialogContent>
        <DialogActions className="px-4 pb-3 flex-wrap gap-2">
          <Button onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            startIcon={deliveryMode === 'schedule' ? <ScheduleIcon /> : <SendIcon />}
          >
            {submitting ? 'Salvando…' : deliveryMode === 'schedule' ? 'Agendar' : 'Enviar agora'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
