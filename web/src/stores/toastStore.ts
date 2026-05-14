import { create } from 'zustand';

type ToastStore = {
  message: string;
  show: (message: string) => void;
  hide: () => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  message: '',
  show: (message) => set({ message }),
  hide: () => set({ message: '' }),
}));
