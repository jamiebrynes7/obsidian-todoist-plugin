<script lang="ts">
  import type { Task } from "../data/task";
  import {
    buildTaskTree,
    sortTasks,
    type TaskTree,
  } from "../data/transformations";
  import type { Sort } from "../query/query";
  import TaskList from "./TaskList.svelte";

  export let tasks: Task[];
  export let sorting: Sort[];

  $: taskTrees = getTaskTree(tasks);

  function getTaskTree(tasks: Task[]): TaskTree[] {
    sortTasks(tasks, sorting);
    return buildTaskTree(tasks);
  }
</script>

<TaskList {taskTrees} />
