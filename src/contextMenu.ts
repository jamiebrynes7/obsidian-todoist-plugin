import { Menu, Notice } from "obsidian";
import type { Point } from "obsidian";
import type { Task } from "./data/task";
import type { TaskId } from "./api/domain/task";

interface TaskContext {
  task: Task;
  closeTask: (id: TaskId) => Promise<void>;
}

export function showTaskContext(
  taskCtx: TaskContext,
  position: Point
) {
  new Menu()
    .addItem((menuItem) =>
      menuItem
        .setTitle("Complete task")
        .setIcon("check-small")
        .onClick(async () => taskCtx.closeTask(taskCtx.task.id))
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
            `https://todoist.com/app/project/${taskCtx.task.project?.id}/task/${taskCtx.task.id}`
          )
        )
    )
    .showAtPosition(position);
}

// A bit hacky, but in order to simulate clicking a link
// we create a unparented DOM element, dispatch an event,
// then remove the link. Using electron's openExternal doesn't
// work on mobile unfortunately.
function openExternal(url: string): void {
  const link = document.createElement("a");
  link.href = url;

  const clickEvent = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    view: window
  });

  link.dispatchEvent(clickEvent);
  link.remove();
}