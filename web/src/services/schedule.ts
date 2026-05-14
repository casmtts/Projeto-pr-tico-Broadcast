import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/pt-br';

dayjs.extend(customParseFormat);
dayjs.locale('pt-br');

export const toDatetimeLocalValue = (date: Date) => dayjs(date).format('YYYY-MM-DDTHH:mm');

export const fromDatetimeLocalValue = (value: string) => {
  if (!value) {
    return null;
  }

  const parsed = dayjs(value, 'YYYY-MM-DDTHH:mm', true);
  return parsed.isValid() ? parsed.toDate() : null;
};

export const isPastDatetime = (date: Date, now = new Date()) => dayjs(date).isBefore(dayjs(now));

export const formatDateTime = (date: Date) => dayjs(date).format('DD/MM/YYYY HH:mm');
