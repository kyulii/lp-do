import { create } from "zustand";

type ArchiveState = {
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
};

export const useArchiveStore = create<ArchiveState>((set) => ({
  selectedDate: null,
  setSelectedDate: (date) => set({ selectedDate: date }),
}));
