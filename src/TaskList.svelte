<script lang="ts">
  import { fade } from "svelte/transition";
  import type { Task, ID, TodoistApi } from "./api";
  import type { ISettings } from "./settings";

  export let tasks: Task[];
  export let settings: ISettings;
  export let api: TodoistApi;
  export let sorting: string[];

  let tasksPendingClose: ID[] = [];
  $: todos = tasks
    .filter((task) => !tasksPendingClose.includes(task.id))
    .sort((first: Task, second: Task) => first.compareTo(second, sorting));

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

<ul class="contains-task-list">
  {#each todos as todo (todo.id)}
    <li
      transition:fade={{ duration: settings.fadeToggle ? 400 : 0 }}
      class="task-list-item">
      <div class={getPriorityClass(todo.priority)}>
        <input
          data-line="1"
          class="task-list-item-checkbox"
          type="checkbox"
          on:click|preventDefault={async () => {
            await onClickTask(todo);
          }} />
        {todo.content}
      </div>
      <div class="task-project">
        <svg
          class="task-project-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 2H8l-1-2H5V5z"
            clip-rule="evenodd" />
        </svg>
        {todo.project}
        {#if todo.section}| {todo.section}{/if}
      </div>
      {#if settings.renderDate && todo.date}
        <div class="task-date {todo.isOverdue() ? 'task-overdue' : ''}">
          {#if settings.renderDateIcon}
            <svg
              class="task-calendar-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clip-rule="evenodd" />
            </svg>
          {/if}
          {todo.date}
        </div>
      {/if}
      {#if todo.children.length != 0}
        <svelte:self tasks={todo.children} {settings} {api} {sorting} />
      {/if}
    </li>
  {/each}
</ul>
