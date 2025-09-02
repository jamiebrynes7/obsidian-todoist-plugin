import { create } from "zustand";

export type AddPageLinkSetting = "off" | "description" | "content";

export type DueDateDefaultSetting = "none" | "today" | "tomorrow";

export type ProjectDefaultSetting = {
  projectId: string;
  projectName: string;
} | null;

const defaultSettings: Settings = {
  fadeToggle: true,

  autoRefreshToggle: false,
  autoRefreshInterval: 60,

  renderDateIcon: true,
  renderProjectIcon: true,
  renderLabelsIcon: true,

  shouldWrapLinksInParens: false,
  addTaskButtonAddsPageLink: "content",

  taskCreationDefaultDueDate: "none",

  taskCreationDefaultProject: null,

  debugLogging: false,

  useQuickAddEndpoint: false,
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

  taskCreationDefaultDueDate: DueDateDefaultSetting;

  taskCreationDefaultProject: ProjectDefaultSetting;

  debugLogging: boolean;

  useQuickAddEndpoint: boolean;
};

export const useSettingsStore = create<Settings>(() => ({
  ...defaultSettings,
}));
