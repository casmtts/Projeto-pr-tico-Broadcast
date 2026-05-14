export type ConfirmState = {
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
} | null;
