import { create } from 'zustand';

interface PlasmaConfig {
  color: string;
  speed: number;
  scale: number;
  opacity: number;
  mouseInteractive: boolean;
  isVisible: boolean;
}

interface PlasmaStore {
  config: PlasmaConfig;
  setConfig: (config: Partial<PlasmaConfig>) => void;
}

export const usePlasmaStore = create<PlasmaStore>((set) => ({
  config: {
    color: '#00d4ff',
    speed: 0.5,
    scale: 1.0,
    opacity: 0.6,
    mouseInteractive: true,
    isVisible: true,
  },
  setConfig: (newConfig) =>
    set((state) => ({
      config: { ...state.config, ...newConfig },
    })),
}));
