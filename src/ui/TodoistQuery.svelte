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
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    ><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path
      d="M3 3v5h5"
    /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path
      d="M16 16h5v5"
    />
  </svg>
</div>
<div
  class="edit-block-button todoist-add-button"
  on:click={() => {
    callTaskModal();
  }}
  aria-label="Add item"
>
  <svg
    class="svg-icon lucide-code-2"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg
  >
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
