import type { MakeCommand } from "@/commands";
import type { Translations } from "@/i18n/translation";
import type TodoistPlugin from "@/index";
import type { TaskCreationOptions } from "@/ui/createTaskModal";
import { MarkdownView, type TFile } from "obsidian";

export const addTask: MakeCommand = (plugin: TodoistPlugin, i18n: Translations["commands"]) => {
  return {
    name: i18n.addTask,
    callback: makeCallback(plugin),
  };
};

export const addTaskWithPageInContent: MakeCommand = (
  plugin: TodoistPlugin,
  i18n: Translations["commands"],
) => {
  return {
    id: "add-task-page-content",
    name: i18n.addTaskPageContent,
    callback: makeCallback(plugin, { appendLinkToContent: true }),
  };
};

export const addTaskWithPageInDescription: MakeCommand = (
  plugin: TodoistPlugin,
  i18n: Translations["commands"],
) => {
  return {
    id: "add-task-page-description",
    name: i18n.addTaskPageDescription,
    callback: makeCallback(plugin, { appendLinkToDescription: true }),
  };
};

const makeCallback = (plugin: TodoistPlugin, opts?: Partial<TaskCreationOptions>) => {
  return () => {
    plugin.services.modals.taskCreation({
      initialContent: grabSelection(plugin),
      fileContext: getFileContext(plugin),
      options: {
        appendLinkToContent: false,
        appendLinkToDescription: false,
        ...(opts ?? {}),
      },
    });
  };
};

const grabSelection = (plugin: TodoistPlugin): string => {
  const editorView = plugin.app.workspace.getActiveViewOfType(MarkdownView)?.editor;

  if (editorView !== undefined) {
    return editorView.getSelection();
  }

  return window.getSelection()?.toString() ?? "";
};

const getFileContext = (plugin: TodoistPlugin): TFile | undefined => {
  return plugin.app.workspace.getActiveFile() ?? undefined;
};
