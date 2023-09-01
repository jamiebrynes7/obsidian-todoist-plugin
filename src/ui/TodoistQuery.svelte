<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { settings } from "../settings";
  import type { Query } from "../query/query";
  import CreateTaskModal from "../modals/createTask/createTaskModal";
  import NoTaskDisplay from "./NoTaskDisplay.svelte";
  import type { TodoistAdapter } from "../data";
  import type { Task } from "../data/task";
  import GroupedTasks from "./GroupedTasks.svelte";
  import type { TaskId } from "../api/domain/task";
  import TaskListRoot from "./TaskListRoot.svelte";
  import { Notice } from "obsidian";
  import { setTaskActions } from "./contexts";

  export let query: Query;
  export let todoistAdapter: TodoistAdapter;

  setTaskActions({
    close: async (id: TaskId) => {
      tasksPendingClose.add(id);
      tasksPendingClose = tasksPendingClose;

      let success = true;
      try {
        await todoistAdapter.actions.closeTask(id);
      } catch (error) {
        console.error(`Failed to mark task as closed: ${error}`);
        success = false;
      }

      if (success) {
        tasks = tasks.filter((t) => t.id !== id);
      } else {
        new Notice("Failed to close task", 2000);
      }

      tasksPendingClose.delete(id);
      tasksPendingClose = tasksPendingClose;
    },
  });

  let autoRefreshIntervalId: number = null;
  let fetchedOnce: boolean = false;
  let fetching: boolean = false;
  let tasks: Task[] = [];
  let tasksPendingClose: Set<TaskId> = new Set();

  const [unsubscribeQuery, refreshQuery] = todoistAdapter.subscribe(
    query.filter,
    (result) => {
      switch (result.type) {
        case "success":
          tasks = result.tasks;
          break;
      }
    }
  );

  // Setup auto-refresh interval.
  $: {
    if (autoRefreshIntervalId != null) {
      clearInterval(autoRefreshIntervalId);
      autoRefreshIntervalId = null;
    }

    const interval =
      query?.autorefresh ??
      ($settings.autoRefreshToggle ? $settings.autoRefreshInterval : 0);

    if (interval != 0) {
      autoRefreshIntervalId = window.setInterval(async () => {
        await refreshQuery();
      }, interval * 1000);
    }
  }

  $: filteredTasks = tasks.filter((t) => !tasksPendingClose.has(t.id));
  $: taskCount = filteredTasks.length;
  $: title = query.name.replace("{task_count}", `${taskCount}`);

  onMount(async () => {
    await forceRefresh();
  });

  onDestroy(() => {
    unsubscribeQuery();

    if (autoRefreshIntervalId != null) {
      clearInterval(autoRefreshIntervalId);
    }
  });

  function callTaskModal() {
    new CreateTaskModal(app, todoistAdapter, $settings, true);
  }

  async function forceRefresh() {
    fetching = true;

    await refreshQuery();

    fetchedOnce = true;
    fetching = false;
  }
</script>

<h4 class="todoist-query-title">{title}</h4>
<div
  class="edit-block-button todoist-add-button"
  on:click={() => {
    callTaskModal();
  }}
  aria-label="Add item"
>
  <svg
    class="svg-icon lucide-code-2"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      d="M9 1v8H1v2h8v8h2v-8h8v-2h-8V1h-2z"
      clip-rule="evenodd"
    />
  </svg>
</div>
<div
  class={fetching
    ? "edit-block-button todoist-refresh-button todoist-refresh-disabled"
    : "edit-block-button todoist-refresh-button"}
  on:click={async () => {
    await forceRefresh();
  }}
  aria-label="Refresh list"
>
  <svg
    class={fetching
      ? "svg-icon lucide-code-2 todoist-refresh-spin"
      : "svg-icon lucide-code-2"}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
      clip-rule="evenodd"
    />
  </svg>
</div>
<br />
{#if fetchedOnce}
  {#if filteredTasks.length === 0}
    <NoTaskDisplay />
  {:else if query.group}
    <GroupedTasks tasks={filteredTasks} sorting={query.sorting ?? []} />
  {:else}
    <TaskListRoot tasks={filteredTasks} sorting={query.sorting ?? []} />
  {/if}
{/if}
