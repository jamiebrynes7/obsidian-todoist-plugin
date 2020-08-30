<script>
  import { onMount, onDestroy } from "svelte";
  import { fade } from "svelte/transition";
  import { Settings } from "./settings";

  export let query;
  export let token;

  let settings;
  let autoRefreshIntervalId = null;

  const settingsUnsub = Settings.subscribe(value => { settings = value; });

  $: {

    if (query?.autorefresh) {
      // First, if query.autorefresh is set.. we always use that value.
      if (autoRefreshIntervalId == null) {
        autoRefreshIntervalId = setInterval(async () => { await fetchTodos(); }, query.autorefresh * 1000);
      }
    } else {
      // Otherwise we use the settings value.
      if (autoRefreshIntervalId != null) {
        clearInterval(autoRefreshIntervalId);
        autoRefreshIntervalId = null;
      }

      if (settings.autoRefreshToggle) {
        autoRefreshIntervalId = setInterval(async () => { await fetchTodos(); }, settings.autoRefreshInterval * 1000);
      }
    }
  }

  let fetching = false;
  let tasks = [];
  let tasksPendingClose = [];
  $: todos = tasks.filter(task => !tasksPendingClose.includes(task.id));

  onMount(async () => {
    await fetchTodos();
  });

  onDestroy(() => {
    settingsUnsub();

    if (autoRefreshIntervalId != null) {
      clearInterval(autoRefreshIntervalId);
    }
  });

  async function onClickTask(task) {
    tasksPendingClose.push(task.id);
    tasksPendingClose = tasksPendingClose;

    const res = await fetch(`https://api.todoist.com/rest/v1/tasks/${task.id}/close`, {
      headers: new Headers({
        'Authorization': `Bearer ${token}`
      }),
      method: 'POST'
    });

    if (res.ok) {
      tasks.filter(otherTask => otherTask.id == task.id);
      tasks = tasks;
    }

    tasksPendingClose.filter(id => id == task.id);
    tasksPendingClose = tasksPendingClose;
  }

  async function fetchTodos() {
    fetching = true;
    const url = new URL(`https://api.todoist.com/rest/v1/tasks?filter=${encodeURIComponent(query.filter)}`);
    const res = await fetch(url, {
      headers: new Headers({
        'Authorization': `Bearer ${token}`
      }),
    });

    let newTodos = await res.json();
    newTodos.forEach(task => task.done = false);
    newTodos.sort((first, second) => first.order - second.order);
    tasks = newTodos;
    fetching = false;
  }

  // For some reason, the Todoist API returns priority in reverse order from
  // the p1/p2/p3/p4 fluent entry notation.
  function getPriorityClass(priority) {
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

<h4 class="todoist-query-title">{ query.name }</h4>
<button
  class="todoist-refresh-button"
  on:click={async () => { await fetchTodos() }}
  disabled='{fetching}'
>
  <svg
    class="{fetching ? 'todoist-refresh-spin' : ''}"
    width="20px" height="20px"
    viewBox="0 0 20 20"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    >
      <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
  </svg>
</button>
<br/>
<ul>
{#each todos as todo (todo.id)}
<li 
  transition:fade="{{ duration: settings.fadeToggle ? 400 : 0}}" 
  class="task-list-item {getPriorityClass(todo.priority)}"
>
  <input 
    data-line="1" 
    class="task-list-item-checkbox"
    type="checkbox" 
    on:click|preventDefault={async () => { await onClickTask(todo)}}
  >
  { todo.content }
</li>
{/each}
</ul>