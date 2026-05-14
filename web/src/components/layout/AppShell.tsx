import type { ReactNode } from 'react';
import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

type Props = {
  userEmail: string | null | undefined;
  onLogout: () => void;
  /** Ex.: menu para navegação em telas pequenas */
  leadingToolbar?: ReactNode;
  children: ReactNode;
};

export const AppShell = ({ userEmail, onLogout, leadingToolbar, children }: Props) => (
  <Box className="min-h-screen bg-[#f6f8fb]">
    <AppBar position="static" color="inherit" elevation={0}>
      <Toolbar className="gap-2 sm:gap-3 border-b border-[#e3e8ef] min-h-14">
        {leadingToolbar}
        <Typography
          variant="h6"
          className="font-semibold text-[#162033] shrink-0 text-[clamp(1rem,3.5vw,1.25rem)]"
        >
          Broadcast
        </Typography>
        <Box className="flex-1 min-w-2" />
        <Typography
          className="hidden sm:block text-sm text-[#5f6b7a] max-w-[40vw] truncate text-right"
          title={userEmail ?? undefined}
        >
          {userEmail}
        </Typography>
        <IconButton aria-label="Sair" onClick={() => void onLogout()} size="medium">
          <LogoutIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
    {children}
  </Box>
);
