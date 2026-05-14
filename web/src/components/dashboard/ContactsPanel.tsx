import { Box, Button, CircularProgress, IconButton, Paper, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { formatPhoneBr } from '@/services/phone';
import type { Contact } from '@/types/domain';

type Props = {
  contacts: Contact[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (contact: Contact) => void;
  onRequestDelete: (contact: Contact) => void;
};

export const ContactsPanel = ({ contacts, loading, onAdd, onEdit, onRequestDelete }: Props) => (
  <Box className="mt-6">
    <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>
      Novo contato
    </Button>
    <Box className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {loading && (
        <Box className="col-span-full py-8 flex justify-center">
          <CircularProgress size={24} />
        </Box>
      )}
      {!loading && contacts.length === 0 && (
        <Typography className="col-span-full py-8 text-center text-sm text-[#5f6b7a]">
          Nenhum contato nesta conexão.
        </Typography>
      )}
      {contacts.map((contact) => (
        <Paper key={contact.id} variant="outlined" className="p-4">
          <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Typography className="font-medium">{contact.nome}</Typography>
              <Typography className="text-sm text-[#5f6b7a]">
                {formatPhoneBr(contact.telefone)}
              </Typography>
            </Box>
            <Stack direction="row">
              <IconButton aria-label="Editar contato" onClick={() => onEdit(contact)}>
                <EditIcon />
              </IconButton>
              <IconButton aria-label="Excluir contato" onClick={() => onRequestDelete(contact)}>
                <DeleteIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Paper>
      ))}
    </Box>
  </Box>
);
