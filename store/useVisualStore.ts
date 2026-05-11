import { create } from "zustand";

export type VisualType = "none" | "player" | "globe" | "chart";

interface VisualState {
  activeVisual: {
    type: VisualType;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setVisual: (type: VisualType, data?: any) => void;
  clearVisual: () => void;
}

export const useVisualStore = create<VisualState>((set) => ({
  activeVisual: { type: "none", data: null },
  setVisual: (type, data = null) => set({ activeVisual: { type, data } }),
  clearVisual: () => set({ activeVisual: { type: "none", data: null } }),
}));
