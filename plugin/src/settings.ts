import { create } from "zustand";

const defaultSettings: Settings = {
  fadeToggle: true,

  autoRefreshToggle: false,
  autoRefreshInterval: 60,

  renderDateIcon: true,
  renderProjectIcon: true,
  renderLabelsIcon: true,

  shouldWrapLinksInParens: false,

  debugLogging: false,
};

export type Settings = {
  fadeToggle: boolean;
  autoRefreshToggle: boolean;
  autoRefreshInterval: number;

  renderDateIcon: boolean;

  renderProjectIcon: boolean;

  renderLabelsIcon: boolean;

  shouldWrapLinksInParens: boolean;

  debugLogging: boolean;
};

export const useSettingsStore = create<Settings>((set) => ({
  ...defaultSettings,
}));
