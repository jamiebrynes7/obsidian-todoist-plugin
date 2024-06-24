import { MarkdownView, TFile } from "obsidian";
import type { MakeCommand } from ".";
import type TodoistPlugin from "..";
import type { TaskCreationOptions } from "../ui/createTaskModal";

export const addTask: MakeCommand = (plugin: TodoistPlugin) => {
  return {
    name: "Add task",
    callback: makeCallback(plugin),
  };
};

export const addTaskWithPageInContent: MakeCommand = (plugin: TodoistPlugin) => {
  return {
    id: "add-task-page-content",
    name: "Add task with current page in task content",
    callback: makeCallback(plugin, { appendLinkToContent: true }),
  };
};

export const addTaskWithPageInDescription: MakeCommand = (plugin: TodoistPlugin) => {
  return {
    id: "add-task-page-description",
    name: "Add task with current page in task description",
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
