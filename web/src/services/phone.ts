export const keepPhoneDigits = (value: string) => value.replace(/\D/g, '').slice(0, 11);

/** Formatação visual (Brasil): (DD) NNNNN-NNNN ou (DD) NNNN-NNNN com até 11 dígitos. */
export function formatPhoneBr(digits: string): string {
  const d = keepPhoneDigits(digits);
  if (!d) {
    return '';
  }
  if (d.length <= 2) {
    return `(${d}`;
  }
  if (d.length <= 6) {
    return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  }
  if (d.length <= 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}
