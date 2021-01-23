import { Menu, Notice, Point } from "obsidian";
import type { Task } from "./api/models";

interface TaskContext {
  task: Task;
  onClickTask: (task: Task) => Promise<void>;
}

export function showTaskContext(taskCtx: TaskContext, position: Point) {
  new Menu()
    .addItem((menuItem) =>
      menuItem
        .setTitle("Complete task")
        .setIcon("check-small")
        .onClick(async () => taskCtx.onClickTask(taskCtx.task))
    )
    .addItem((menuItem) =>
      menuItem
        .setTitle("Open task in Todoist (app)")
        .setIcon("popup-open")
        .onClick(() => {
          openExternal(`todoist://task?id=${taskCtx.task.id}`);
        })
    )
    .addItem((menuItem) =>
      menuItem
        .setTitle("Open task in Todoist (web)")
        .setIcon("popup-open")
        .onClick(() =>
          openExternal(
            `https://todoist.com/app/project/${taskCtx.task.projectID}/task/${taskCtx.task.id}`
          )
        )
    )
    .showAtPosition(position);
}

const openExternal: (url: string) => Promise<void> = async (url: string) => {
  try {
    await electronOpenExternal(url);
  } catch {
    new Notice("Failed to open in external application.");
  }
};

const electronOpenExternal: (url: string) => Promise<void> = (() => {
  return require("electron").shell.openExternal;
})();
