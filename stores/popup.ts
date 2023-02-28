import { create } from "zustand";

// TODO: colors
interface PopupStore {
  open: boolean;
  text: string;
  openPopup: (text: string, onOk?: () => void) => void;
  closePopup: () => void;
  onOk: () => void;
}

export const usePopupStore = create<PopupStore>((set) => ({
  open: false,
  text: "",
  openPopup: (text: string, onOk: () => void = () => {}) =>
    set({ open: true, text, onOk }),
  closePopup: () => set({ open: false, text: "" }),
  onOk: () => set({ open: false, text: "" }),
}));
