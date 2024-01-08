<script lang="ts">
  import type { Task } from "../data/task";
  import {
    buildTaskTree,
    sortTasks,
    type Sort,
    type TaskTree,
  } from "../data/transformations";
  import TaskList from "./TaskList.svelte";

  export let tasks: Task[];
  export let sorting: string[];

  $: taskTrees = getTaskTree(tasks);

  function getTaskTree(tasks: Task[]): TaskTree[] {
    sortTasks(tasks, sorting as Sort[]);
    return buildTaskTree(tasks);
  }
</script>

<TaskList {taskTrees} />
