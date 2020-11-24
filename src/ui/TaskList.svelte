<script lang="ts">
  import { onDestroy } from "svelte";
  import { fade } from "svelte/transition";
  import type { TodoistApi, ITodoistMetadata } from "../api/api";
  import type { Task, ID } from "../api/models";
  import { UnknownProject, UnknownSection } from "../api/raw_models";
  import type { ISettings } from "../settings";
  import NoTaskDisplay from "./NoTaskDisplay.svelte";

  export let tasks: Task[];
  export let settings: ISettings;
  export let api: TodoistApi;
  export let sorting: string[];
  export let renderProject: boolean = true;
  export let renderNoTaskInfo: boolean = true;

  let metadata: ITodoistMetadata = null;
  const metadataUnsub = api.metadata.subscribe((value) => (metadata = value));

  onDestroy(() => {
    metadataUnsub();
  });

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

{#if todos.length != 0}
  <ul class="contains-task-list">
    {#each todos as todo (todo.id)}
      <li
        transition:fade={{ duration: settings.fadeToggle ? 400 : 0 }}
        class="task-list-item {todo.isOverdue() ? 'task-overdue' : ''}
          {todo.hasTime ? 'has-time' : 'has-no-time'}">
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
        <div class="task-metadata">
          {#if settings.renderProject && renderProject}
            <div class="task-project">
              {#if settings.renderProjectIcon}
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
              {/if}
              {metadata.projects.get_or_default(todo.projectID, UnknownProject).name}
              {#if todo.sectionID}
                |
                {metadata.sections.get_or_default(todo.sectionID, UnknownSection).name}
              {/if}
            </div>
          {/if}
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
          {#if settings.renderLabels && todo.labelIDs.length > 0}
            <div class="task-labels">
              {#if settings.renderLabelsIcon}
                <svg
                  class="task-labels-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                    clip-rule="evenodd" />
                </svg>
              {/if}
              {#each todo.labelIDs as labelID, i}
                {metadata.labels.get_or_default(labelID, 'Unknown label')}{#if i != todo.labelIDs.length - 1}
                  ,
                {/if}
              {/each}
            </div>
          {/if}
        </div>
        {#if todo.children.length != 0}
          <svelte:self
            tasks={todo.children}
            {settings}
            {api}
            {sorting}
            {renderProject} />
        {/if}
      </li>
    {/each}
  </ul>
{:else if renderNoTaskInfo}
  <NoTaskDisplay />
{/if}
