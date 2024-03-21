import { type Command as ObsidianCommand, Notice } from "obsidian";
import type TodoistPlugin from "..";
import debug from "../log";
import CreateTaskModal from "../modals/createTask/createTaskModal";

type MakeCommand = (plugin: TodoistPlugin) => ObsidianCommand;

const syncCommand: MakeCommand = (plugin: TodoistPlugin) => {
  return {
    id: "todoist-sync",
    name: "Sync with Todoist",
    callback: async () => {
      debug("Syncing with Todoist API");
      plugin.services.todoist.sync();
    },
  };
};

const addTask: MakeCommand = (plugin: TodoistPlugin) => {
  return {
    id: "todoist-add-task",
    name: "Add Todoist task",
    callback: () => {
      if (plugin.options === null) {
        new Notice("Failed to load settings, cannot open task creation modal.");
        return;
      }

      new CreateTaskModal(plugin.app, plugin.services.todoist, plugin.options, false);
    },
  };
};

const addTaskWithPage: MakeCommand = (plugin: TodoistPlugin) => {
  return {
    id: "todoist-add-task-current-page",
    name: "Add Todoist task with the current page",
    callback: () => {
      if (plugin.options === null) {
        new Notice("Failed to load settings, cannot open task creation modal.");
        return;
      }

      new CreateTaskModal(plugin.app, plugin.services.todoist, plugin.options, true);
    },
  };
};

const commands: MakeCommand[] = [syncCommand, addTask, addTaskWithPage];

export const registerCommands = (plugin: TodoistPlugin) => {
  for (const make of commands) {
    plugin.addCommand(make(plugin));
  }
};
