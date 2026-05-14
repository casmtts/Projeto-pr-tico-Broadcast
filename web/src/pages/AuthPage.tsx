import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material';
import { loginSchema, registerSchema } from '@/schemas/forms';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/utils/cn';
import { messageForAuthFailure } from '@/utils/authErrors';

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export const AuthPage = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const activeForm = isRegister ? registerForm : loginForm;

  const onLogin = async (data: LoginValues) => {
    loginForm.clearErrors('root');
    try {
      await login(data.email, data.password);
    } catch (caught) {
      loginForm.setError('root', { message: messageForAuthFailure(caught) });
    }
  };

  const onRegister = async (data: RegisterValues) => {
    registerForm.clearErrors('root');
    try {
      await register(data.name, data.email, data.password);
    } catch (caught) {
      registerForm.setError('root', { message: messageForAuthFailure(caught) });
    }
  };

  const toggleMode = () => {
    setIsRegister((current) => !current);
    loginForm.reset({ email: '', password: '' });
    registerForm.reset({ name: '', email: '', password: '' });
    loginForm.clearErrors();
    registerForm.clearErrors();
  };

  return (
    <Box className="min-h-screen bg-[#f6f8fb] flex items-center justify-center px-4 py-6">
      <Paper className={cn('w-full max-w-md p-4 sm:p-6')} elevation={0}>
        <Typography variant="h4" className="font-semibold text-[#162033] text-[clamp(1.25rem,4vw,2rem)]">
          Broadcast SaaS
        </Typography>
        <Typography className="mt-1 text-[#5f6b7a] text-sm sm:text-base">
          Entre para gerenciar conexões, contatos e mensagens.
        </Typography>
        <Box
          component="form"
          className="mt-6 flex flex-col gap-4"
          onSubmit={
            isRegister
              ? registerForm.handleSubmit(onRegister)
              : loginForm.handleSubmit(onLogin)
          }
        >
          {activeForm.formState.errors.root && (
            <Alert severity="error">{activeForm.formState.errors.root.message}</Alert>
          )}
          {isRegister && (
            <TextField
              label="Nome"
              required
              {...registerForm.register('name')}
              error={Boolean(registerForm.formState.errors.name)}
              helperText={registerForm.formState.errors.name?.message}
            />
          )}
          <TextField
            label="E-mail"
            type="email"
            required
            {...(isRegister ? registerForm.register('email') : loginForm.register('email'))}
            error={Boolean(activeForm.formState.errors.email)}
            helperText={activeForm.formState.errors.email?.message}
          />
          <TextField
            label="Senha"
            type="password"
            required
            {...(isRegister ? registerForm.register('password') : loginForm.register('password'))}
            error={Boolean(activeForm.formState.errors.password)}
            helperText={activeForm.formState.errors.password?.message}
          />
          <Button type="submit" variant="contained" size="large" className="min-h-12">
            {isRegister ? 'Criar conta' : 'Entrar'}
          </Button>
          <Button type="button" onClick={toggleMode}>
            {isRegister ? 'Já tenho conta' : 'Criar uma conta'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
