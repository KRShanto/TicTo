import { create } from "zustand";

interface ConfirmStore {
  open: boolean;
  text: string;
  textType: "Green" | "Red";
  openPopup: (
    text: string,
    onConfirm: () => void,
    onCancel: () => void
  ) => void;
  closePopup: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const useConfirmStore = create<ConfirmStore>((set) => ({
  open: false,
  text: "",
  textType: "Green",
  openPopup: (text: string, onConfirm: () => void, onCancel: () => void) =>
    set({ open: true, text, onConfirm, onCancel }),
  closePopup: () => set({ open: false, text: "" }),
  onConfirm: () => set({ open: false, text: "" }),
  onCancel: () => set({ open: false, text: "" }),
}));
