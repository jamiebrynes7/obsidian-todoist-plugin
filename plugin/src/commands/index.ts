import { t } from "@/i18n";
import type { Translations } from "@/i18n/translation";
import type { Command as ObsidianCommand } from "obsidian";
import type TodoistPlugin from "..";
import debug from "../log";
import { addTask, addTaskWithPageInContent, addTaskWithPageInDescription } from "./addTask";

export type MakeCommand = (
  plugin: TodoistPlugin,
  i18n: Translations["commands"],
) => Omit<ObsidianCommand, "id">;

const syncCommand: MakeCommand = (plugin: TodoistPlugin, i18n: Translations["commands"]) => {
  return {
    name: i18n.sync,
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
  const i18n = t().commands;
  for (const [id, make] of Object.entries(commands)) {
    plugin.addCommand({ id, ...make(plugin, i18n) });
  }
};

export const fireCommand = <K extends CommandId>(id: K, plugin: TodoistPlugin) => {
  const i18n = t().commands;
  const make = commands[id];
  make(plugin, i18n).callback?.();
};
