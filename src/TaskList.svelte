<script lang="ts">
  import { fade } from "svelte/transition";
  import type { Task, ID, TodoistApi } from "./api";
  import type { ISettings } from "./settings";

  export let tasks: Task[];
  export let settings: ISettings;
  export let api: TodoistApi;

  let tasksPendingClose: ID[] = [];
  $: todos = tasks.filter((task) => !tasksPendingClose.includes(task.id));

  async function onClickTask(task: Task) {
    tasksPendingClose.push(task.id);
    tasksPendingClose = tasksPendingClose;

    if (await api.closeTask(task.id)) {
      tasks.filter((otherTask) => otherTask.id == task.id);
      tasks = tasks;
    }

    tasksPendingClose.filter((id) => id == task.id);
    tasksPendingClose = tasksPendingClose;
  }

  // For some reason, the Todoist API returns priority in reverse order from
  // the p1/p2/p3/p4 fluent entry notation.
  function getPriorityClass(priority: number): string {
    switch (priority) {
      case 1:
        return "todoist-p4";
      case 2:
        return "todoist-p3";
      case 3:
        return "todoist-p2";
      case 4:
        return "todoist-p1";
    }
  }
</script>

<ul>
  {#each todos as todo (todo.id)}
    <li
      transition:fade={{ duration: settings.fadeToggle ? 400 : 0 }}
      class="task-list-item {getPriorityClass(todo.priority)}">
      <input
        data-line="1"
        class="task-list-item-checkbox"
        type="checkbox"
        on:click|preventDefault={async () => {
          await onClickTask(todo);
        }} />
      {todo.content}
      {#if todo.children.length != 0}
        <svelte:self tasks={todo.children} {settings} {api} />
      {/if}
    </li>
  {/each}
</ul>
