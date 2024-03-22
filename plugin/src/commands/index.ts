import { type Command as ObsidianCommand } from "obsidian";
import type TodoistPlugin from "..";
import debug from "../log";
import addTaskCommands from "./addTask";

export type MakeCommand = (plugin: TodoistPlugin) => ObsidianCommand;

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

const commands: MakeCommand[] = [syncCommand, ...addTaskCommands];

export const registerCommands = (plugin: TodoistPlugin) => {
  for (const make of commands) {
    plugin.addCommand(make(plugin));
  }
};

// TODO: Strongly type the IDs
export const fireCommand = (plugin: TodoistPlugin, id: string) => {
  for (const make of commands) {
    const cmd = make(plugin);
    if (cmd.id === id) {
      cmd.callback?.();
      return;
    }
  }

  throw Error(`Failed to find command by ID: ${id}`);
};
