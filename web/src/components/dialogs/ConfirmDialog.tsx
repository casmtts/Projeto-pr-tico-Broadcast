import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import type { ConfirmState } from '@/types/confirm';

type Props = {
  confirm: ConfirmState;
  onClose: () => void;
};

export const ConfirmDialog = ({ confirm, onClose }: Props) => {
  if (!confirm) {
    return null;
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{confirm.title}</DialogTitle>
      <DialogContent>
        <Typography>{confirm.description}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          color="error"
          variant="contained"
          onClick={() => {
            void confirm.onConfirm().finally(onClose);
          }}
        >
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
};
