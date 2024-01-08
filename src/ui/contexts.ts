import { getContext, setContext } from "svelte";
import type { TaskId } from "../api/domain/task";

const taskActionsKey = "todoist-task-actions";

type TaskActions = {
  close: (id: TaskId) => Promise<void>,
}

export function setTaskActions(actions: TaskActions) {
  setContext(taskActionsKey, actions);
}

export function getTaskActions(): TaskActions {
  return getContext(taskActionsKey);
}