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
import { connectionNameSchema } from '@/schemas/forms';
import { zodFieldErrors } from '@/utils/zodFieldErrors';

type Props = {
  title: string;
  initialValue: string;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
};

export const NameDialog = ({ title, initialValue, onClose, onSubmit }: Props) => {
  const [name, setName] = useState(initialValue);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setFieldErrors({});
    const parsed = connectionNameSchema.safeParse({ name });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }
    try {
      await onSubmit(parsed.data.name);
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível salvar.');
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <Box component="form" onSubmit={(event) => void handleSubmit(event)}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            fullWidth
            label="Nome"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setFieldErrors((prev) => {
                const next = { ...prev };
                delete next.name;
                return next;
              });
            }}
            required
            error={Boolean(fieldErrors.name)}
            helperText={fieldErrors.name}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
