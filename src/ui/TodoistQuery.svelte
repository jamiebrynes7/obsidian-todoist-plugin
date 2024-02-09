<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { settings } from "../settings";
  import type { Query } from "../query/query";
  import CreateTaskModal from "../modals/createTask/createTaskModal";
  import NoTaskDisplay from "./NoTaskDisplay.svelte";
  import type { QueryErrorKind, TodoistAdapter } from "../data";
  import type { Task } from "../data/task";
  import GroupedTasks from "./GroupedTasks.svelte";
  import type { TaskId } from "../api/domain/task";
  import TaskListRoot from "./TaskListRoot.svelte";
  import { Notice } from "obsidian";
  import { setQuery, setTaskActions } from "./contexts";
  import ObsidianIcon from "../components/ObsidianIcon.svelte";
  import QueryErrorDisplay from "./QueryErrorDisplay.svelte";

  export let query: Query;
  export let todoistAdapter: TodoistAdapter;

  // Set context items.
  setQuery(query);
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
  let queryError: QueryErrorKind | undefined = undefined;

  const [unsubscribeQuery, refreshQuery] = todoistAdapter.subscribe(
    query.filter,
    (result) => {
      switch (result.type) {
        case "success":
          queryError = undefined;
          tasks = result.tasks;
          break;
        case "error":
          queryError = result.kind;
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

    // Use the query autorefresh, or look to the settings if its zero
    let interval = query.autorefresh;

    if (interval === 0) {
      interval = $settings.autoRefreshToggle
        ? $settings.autoRefreshInterval
        : 0;
    }

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

{#if title.length != 0}
  <h4 class="todoist-query-title">{title}</h4>
{/if}
<div
  class="edit-block-button todoist-refresh-button"
  on:click={async () => {
    await forceRefresh();
  }}
  aria-label="Refresh list"
>
  <ObsidianIcon
    class={fetching ? "todoist-refresh-spin" : ""}
    iconId="refresh-ccw"
    size={24}
  />
</div>
<div
  class="edit-block-button todoist-add-button"
  on:click={() => {
    callTaskModal();
  }}
  aria-label="Add item"
>
  <ObsidianIcon iconId="plus" size={24} />
</div>
<br />
{#if fetchedOnce}
  {#if queryError !== undefined}
    <QueryErrorDisplay kind={queryError} />
  {:else if filteredTasks.length === 0}
    <NoTaskDisplay />
  {:else if query.group}
    <GroupedTasks tasks={filteredTasks} />
  {:else}
    <TaskListRoot tasks={filteredTasks} />
  {/if}
{/if}
