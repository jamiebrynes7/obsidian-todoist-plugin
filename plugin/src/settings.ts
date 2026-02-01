import { create } from "zustand";

export type AddPageLinkSetting = "off" | "description" | "content";

export type AddTaskAction = "add" | "add-copy-app" | "add-copy-web";

export type DueDateDefaultSetting = "none" | "today" | "tomorrow";

export type TokenStorageSetting = "secrets" | "file";

export type ProjectDefaultSetting = {
  projectId: string;
  projectName: string;
} | null;

export type LabelsDefaultSetting = Array<{
  labelId: string;
  labelName: string;
}>;

const defaultSettings: Settings = {
  apiTokenSecretId: "swt-todoist-api-token",
  tokenStorage: "secrets",

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

  taskCreationDefaultLabels: [],

  defaultAddTaskAction: "add",

  debugLogging: false,

  version: 0,
};

export type Settings = {
  apiTokenSecretId: string;
  tokenStorage: TokenStorageSetting;

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

  taskCreationDefaultLabels: LabelsDefaultSetting;

  defaultAddTaskAction: AddTaskAction;

  debugLogging: boolean;

  version: number;
};

export const useSettingsStore = create<Settings>(() => ({
  ...defaultSettings,
}));
