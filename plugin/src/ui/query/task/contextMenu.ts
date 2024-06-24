import type { Task } from "@/data/task";
import type TodoistPlugin from "@/index";
import { Menu } from "obsidian";
import type { Point } from "obsidian";

type TaskContext = {
  task: Task;
  plugin: TodoistPlugin;
};

export function showTaskContext(ctx: TaskContext, position: Point) {
  new Menu()
    .addItem((menuItem) =>
      menuItem
        .setTitle("Complete task")
        .setIcon("check-small")
        .onClick(async () => await ctx.plugin.services.todoist.actions.closeTask(ctx.task.id)),
    )
    .addItem((menuItem) => 
      menuItem
        .setTitle("Edit Task")
        .setIcon("pencil")
        .onClick(() => ctx.plugin.services.modals.taskEditor({task: ctx.task}))
    )
    .addItem((menuItem) =>
      menuItem
        .setTitle("Open task in Todoist (app)")
        .setIcon("popup-open")
        .onClick(() => {
          openExternal(`todoist://task?id=${ctx.task.id}`);
        }),
    )
    .addItem((menuItem) =>
      menuItem
        .setTitle("Open task in Todoist (web)")
        .setIcon("popup-open")
        .onClick(() =>
          openExternal(
            `https://todoist.com/app/project/${ctx.task.project.id}/task/${ctx.task.id}`,
          ),
        ),
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
    view: window,
  });

  link.dispatchEvent(clickEvent);
  link.remove();
}
