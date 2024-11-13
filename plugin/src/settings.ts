import { create } from "zustand";

export type AddPageLinkSetting = "off" | "description" | "content";

const defaultSettings: Settings = {
  fadeToggle: true,

  autoRefreshToggle: false,
  autoRefreshInterval: 60,

  renderDateIcon: true,
  renderProjectIcon: true,
  renderLabelsIcon: true,

  shouldWrapLinksInParens: false,
  addTaskButtonAddsPageLink: "content",

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
  addTaskButtonAddsPageLink: AddPageLinkSetting;

  debugLogging: boolean;
};

export const useSettingsStore = create<Settings>((set) => ({
  ...defaultSettings,
}));
