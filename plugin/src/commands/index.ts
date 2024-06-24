import { type Command as ObsidianCommand } from "obsidian";
import type TodoistPlugin from "..";
import debug from "../log";
import { addTask, addTaskWithPageInContent, addTaskWithPageInDescription} from "./addTask";

export type MakeCommand = (plugin: TodoistPlugin) => Omit<ObsidianCommand, "id">;

const syncCommand: MakeCommand = (plugin: TodoistPlugin) => {
  return {
    name: "Sync with Todoist",
    callback: async () => {
      debug("Syncing with Todoist API");
      plugin.services.todoist.sync();
    },
  };
};

const commands = {
  "todoist-sync": syncCommand,
  "add-task": addTask,
  "add-task-page-content": addTaskWithPageInContent,
  "add-task-page-description": addTaskWithPageInDescription,
};

type CommandId = keyof typeof commands;

export const registerCommands = (plugin: TodoistPlugin) => {
  for (const [id, make] of Object.entries(commands)) {
    plugin.addCommand({ id, ...make(plugin) });
  }
};

export const fireCommand = <K extends CommandId>(id: K, plugin: TodoistPlugin) => {
  const make = commands[id];
  make(plugin).callback?.();
};
