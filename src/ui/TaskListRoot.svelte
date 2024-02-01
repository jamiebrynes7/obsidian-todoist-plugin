<script lang="ts">
  import type { Task } from "../data/task";
  import {
    buildTaskTree,
    sortTasks,
    type TaskTree,
  } from "../data/transformations";
  import TaskList from "./TaskList.svelte";
  import { getQuery } from "./contexts";

  export let tasks: Task[];
  let query = getQuery();

  $: taskTrees = getTaskTree(tasks);

  function getTaskTree(tasks: Task[]): TaskTree[] {
    sortTasks(tasks, query.sorting);
    return buildTaskTree(tasks);
  }
</script>

<TaskList {taskTrees} />
