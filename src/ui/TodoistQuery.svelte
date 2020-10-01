<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { SettingsInstance, ISettings } from "../settings";
  import type IQuery from "../query";
  import type { TodoistApi } from "../api/api";
  import type { Task, Project } from "../api/models";
  import TaskList from "./TaskList.svelte";
  import GroupedTaskList from "./GroupedTaskList.svelte";

  export let query: IQuery;
  export let api: TodoistApi;

  let settings: ISettings = null;
  let autoRefreshIntervalId: number = null;

  const settingsUnsub = SettingsInstance.subscribe((value) => {
    settings = value;
  });

  $: {
    if (query?.autorefresh) {
      // First, if query.autorefresh is set.. we always use that value.
      if (autoRefreshIntervalId == null) {
        autoRefreshIntervalId = setInterval(async () => {
          await fetchTodos();
        }, query.autorefresh * 1000);
      }
    } else {
      // Otherwise we use the settings value.
      if (autoRefreshIntervalId != null) {
        clearInterval(autoRefreshIntervalId);
        autoRefreshIntervalId = null;
      }

      if (settings.autoRefreshToggle) {
        autoRefreshIntervalId = setInterval(async () => {
          await fetchTodos();
        }, settings.autoRefreshInterval * 1000);
      }
    }
  }

  let tasks: Task[] = [];
  let groupedTasks: Project[] = [];
  let fetching: boolean = false;

  onMount(async () => {
    await fetchTodos();
  });

  onDestroy(() => {
    settingsUnsub();

    if (autoRefreshIntervalId != null) {
      clearInterval(autoRefreshIntervalId);
    }
  });

  async function fetchTodos() {
    if (fetching) {
      return;
    }

    try {
      fetching = true;
      if (query.group) {
        groupedTasks = await api.getTasksGroupedByProject(query.filter);
      } else {
        tasks = await api.getTasks(query.filter);
      }
    } finally {
      fetching = false;
    }
  }
</script>

<h4 class="todoist-query-title">{query.name}</h4>
<button
  class="todoist-refresh-button"
  on:click={async () => {
    await fetchTodos();
  }}
  disabled={fetching}>
  <svg
    class={fetching ? 'todoist-refresh-spin' : ''}
    width="20px"
    height="20px"
    viewBox="0 0 20 20"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg">
    <path
      fill-rule="evenodd"
      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
      clip-rule="evenodd" />
  </svg>
</button>
<br />
{#if tasks.length != 0}
  <TaskList {tasks} {settings} {api} sorting={query.sorting ?? []} />
{:else if groupedTasks.length != 0}
  {#each groupedTasks as project (project.projectID)}
    <GroupedTaskList {project} {settings} {api} sorting={query.sorting ?? []} />
  {/each}
{/if}
