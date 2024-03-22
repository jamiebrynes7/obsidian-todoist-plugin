import { MarkdownView, Notice, TFile } from "obsidian";
import type { MakeCommand } from ".";
import type TodoistPlugin from "..";
import type { TaskCreationOptions } from "../ui/createTaskModal";

const addTask: MakeCommand = (plugin: TodoistPlugin) => {
  return {
    id: "add-task",
    name: "Add task",
    callback: makeCallback(plugin),
  };
};

const addTaskWithPageInContent: MakeCommand = (plugin: TodoistPlugin) => {
  return {
    id: "add-task-page-content",
    name: "Add task with current page in task content",
    callback: makeCallback(plugin, { appendLinkToContent: true }),
  };
};

const addTaskWithPageInDescription: MakeCommand = (plugin: TodoistPlugin) => {
  return {
    id: "add-task-page-description",
    name: "Add task with current page in task description",
    callback: makeCallback(plugin, { appendLinkToDescription: true }),
  };
};

const makeCallback = (plugin: TodoistPlugin, opts?: Partial<TaskCreationOptions>) => {
  return () => {
    if (plugin.options === null) {
      new Notice("Failed to load settings, cannot open task creation modal.");
      return;
    }

    plugin.services.modals
      .taskCreation({
        initialContent: grabSelection(plugin),
        fileContext: getFileContext(plugin),
        options: {
          appendLinkToContent: false,
          appendLinkToDescription: false,
          ...(opts ?? {}),
        },
      })
      .open();
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

export default [addTask, addTaskWithPageInContent, addTaskWithPageInDescription];
