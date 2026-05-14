import {
  Box,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SortIcon from '@mui/icons-material/Sort';
import type { Connection } from '@/types/domain';

type Props = {
  connections: Connection[];
  loading: boolean;
  sortDirection: 'asc' | 'desc';
  selectedConnectionId: string;
  onSortToggle: () => void;
  onAddConnection: () => void;
  onSelectConnection: (id: string) => void;
  onEditConnection: (connection: Connection) => void;
  onDeleteConnection: (connection: Connection) => void;
};

export const Sidebar = ({
  connections,
  loading,
  sortDirection,
  selectedConnectionId,
  onSortToggle,
  onAddConnection,
  onSelectConnection,
  onEditConnection,
  onDeleteConnection,
}: Props) => (
  <Paper component="aside" elevation={0} className="p-4">
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography variant="h6">Conexões</Typography>
      <Stack direction="row">
        <Tooltip title={sortDirection === 'desc' ? 'Mais novas primeiro' : 'Mais antigas primeiro'}>
          <IconButton aria-label="Ordenar conexões" color="primary" onClick={onSortToggle}>
            <SortIcon className={sortDirection === 'asc' ? 'rotate-180' : ''} />
          </IconButton>
        </Tooltip>
        <IconButton aria-label="Nova conexão" color="primary" onClick={onAddConnection}>
          <AddIcon />
        </IconButton>
      </Stack>
    </Stack>
    <List className="mt-2">
      {loading && (
        <Box className="py-8 flex justify-center">
          <CircularProgress size={24} />
        </Box>
      )}
      {!loading && connections.length === 0 && (
        <Typography className="py-8 text-center text-sm text-[#5f6b7a]">
          Nenhuma conexão criada.
        </Typography>
      )}
      {connections.map((connection) => (
        <ListItem
          key={connection.id}
          disablePadding
          secondaryAction={
            <Stack direction="row">
              <IconButton aria-label="Editar conexão" onClick={() => onEditConnection(connection)}>
                <EditIcon />
              </IconButton>
              <IconButton
                aria-label="Excluir conexão"
                onClick={() => onDeleteConnection(connection)}
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
          }
        >
          <ListItemButton
            selected={connection.id === selectedConnectionId}
            onClick={() => onSelectConnection(connection.id)}
          >
            <ListItemText primary={connection.nome} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  </Paper>
);
