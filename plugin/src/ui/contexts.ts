import { getContext, setContext } from "svelte";
import type { TaskId } from "../api/domain/task";
import type { Query } from "../query/query";
import type { Component } from "obsidian";

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

const queryKey = "todoist-query";

export function setQuery(query: Query) {
  setContext(queryKey, query);
}

export function getQuery(): Query {
  return getContext(queryKey);
}

const componentKey = "todoist-component";

export function setComponent(component: Component) {
  setContext(componentKey, component);
}

export function getComponent(): Component {
  return getContext(componentKey);
}