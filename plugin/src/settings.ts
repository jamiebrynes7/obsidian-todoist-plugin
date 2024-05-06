import { create } from "zustand";

const defaultSettings: Settings = {
  fadeToggle: true,

  autoRefreshToggle: false,
  autoRefreshInterval: 60,

  renderDescription: true,

  renderDate: true,
  renderDateIcon: true,

  renderProject: true,
  renderProjectIcon: true,

  renderLabels: true,
  renderLabelsIcon: true,

  shouldWrapLinksInParens: false,

  debugLogging: false,
};

export type Settings = {
  fadeToggle: boolean;
  autoRefreshToggle: boolean;
  autoRefreshInterval: number;

  renderDescription: boolean;

  renderDate: boolean;
  renderDateIcon: boolean;

  renderProject: boolean;
  renderProjectIcon: boolean;

  renderLabels: boolean;
  renderLabelsIcon: boolean;

  shouldWrapLinksInParens: boolean;

  debugLogging: boolean;
};

export const useSettingsStore = create<Settings>((set) => ({
  ...defaultSettings,
}));
