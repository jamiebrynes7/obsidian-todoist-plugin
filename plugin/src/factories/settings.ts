import type { Settings } from "@/settings";

export function makeSettings(overrides?: Partial<Settings>): Settings {
  return {
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
    ...overrides,
  };
}
