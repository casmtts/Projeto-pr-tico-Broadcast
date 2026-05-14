import { z } from 'zod';
import { keepPhoneDigits } from '@/services/phone';
import { fromDatetimeLocalValue, isPastDatetime } from '@/services/schedule';
import type { MessageInput } from '@/services/firestore';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Informe o e-mail').email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
});

export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(1, 'Informe o nome').max(200, 'Nome muito longo'),
});

export const connectionNameSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome').max(100, 'Nome muito longo'),
});

export const contactFormSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome'),
  telefone: z
    .string()
    .refine(
      (value) => keepPhoneDigits(value).length >= 8,
      'Informe um telefone com pelo menos 8 dígitos.',
    ),
});

const messageBodySchema = z.object({
  mensagem: z.string().trim().min(1, 'Digite a mensagem').max(2000, 'Mensagem muito longa'),
  contatosIds: z.array(z.string()).min(1, 'Selecione pelo menos um contato.'),
});

export type MessageFormValues = {
  mensagem: string;
  contatosIds: string[];
  deliveryMode: 'now' | 'schedule';
  scheduledAt: string;
};

export type MessageFormFieldErrors = Partial<
  Record<'mensagem' | 'contatosIds' | 'scheduledAt', string>
>;

export function validateMessageForm(
  values: MessageFormValues,
): { ok: true; data: MessageInput } | { ok: false; fields: MessageFormFieldErrors } {
  const fields: MessageFormFieldErrors = {};
  const parsed = messageBodySchema.safeParse({
    mensagem: values.mensagem,
    contatosIds: values.contatosIds,
  });
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === 'mensagem' || key === 'contatosIds') {
        if (!fields[key]) {
          fields[key] = issue.message;
        }
      }
    }
    return { ok: false, fields };
  }

  if (values.deliveryMode === 'schedule') {
    const scheduleDate = fromDatetimeLocalValue(values.scheduledAt);
    if (!scheduleDate) {
      fields.scheduledAt = 'Informe a data e o horário do agendamento.';
      return { ok: false, fields };
    }
    if (isPastDatetime(scheduleDate)) {
      fields.scheduledAt = 'Escolha um horário atual ou futuro para agendar.';
      return { ok: false, fields };
    }
    return {
      ok: true,
      data: {
        mensagem: parsed.data.mensagem,
        contatosIds: parsed.data.contatosIds,
        scheduledAt: scheduleDate,
      },
    };
  }

  return {
    ok: true,
    data: {
      mensagem: parsed.data.mensagem,
      contatosIds: parsed.data.contatosIds,
      scheduledAt: null,
    },
  };
}

export function validateMessageSubmit(
  values: MessageFormValues,
): { ok: true; data: MessageInput } | { ok: false; error: string } {
  const result = validateMessageForm(values);
  if (result.ok) {
    return result;
  }
  const { fields } = result;
  const error =
    fields.mensagem ??
    fields.contatosIds ??
    fields.scheduledAt ??
    'Dados inválidos.';
  return { ok: false, error };
}
