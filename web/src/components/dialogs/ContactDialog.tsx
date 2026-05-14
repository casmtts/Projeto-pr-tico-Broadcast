import { useState, type FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { contactFormSchema } from '@/schemas/forms';
import { formatPhoneBr, keepPhoneDigits } from '@/services/phone';
import { zodFieldErrors } from '@/utils/zodFieldErrors';
import type { Contact } from '@/types/domain';

type Props = {
  contact?: Contact;
  onClose: () => void;
  onSubmit: (data: Pick<Contact, 'nome' | 'telefone'>) => Promise<void>;
};

export const ContactDialog = ({ contact, onClose, onSubmit }: Props) => {
  const [name, setName] = useState(contact?.nome ?? '');
  const [phone, setPhone] = useState(contact?.telefone ?? '');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setFieldErrors({});
    const parsed = contactFormSchema.safeParse({ nome: name, telefone: phone });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        nome: parsed.data.nome,
        telefone: keepPhoneDigits(parsed.data.telefone),
      });
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível salvar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <Box component="form" onSubmit={(event) => void handleSubmit(event)}>
        <DialogTitle>{contact ? 'Editar contato' : 'Novo contato'}</DialogTitle>
        <DialogContent className="flex flex-col gap-4 pt-2">
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Nome"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setFieldErrors((prev) => {
                const next = { ...prev };
                delete next.nome;
                return next;
              });
            }}
            required
            error={Boolean(fieldErrors.nome)}
            helperText={fieldErrors.nome}
          />
          <TextField
            label="Telefone"
            value={formatPhoneBr(phone)}
            inputMode="numeric"
            placeholder="(11) 98765-4321"
            onChange={(event) => {
              setPhone(keepPhoneDigits(event.target.value));
              setFieldErrors((prev) => {
                const next = { ...prev };
                delete next.telefone;
                return next;
              });
            }}
            required
            error={Boolean(fieldErrors.telefone)}
            helperText={fieldErrors.telefone}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Salvando…' : 'Salvar'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
