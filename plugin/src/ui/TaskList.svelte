<script lang="ts">
  import type { TaskTree } from "../data/transformations";
  import TaskRenderer from "./TaskRenderer.svelte";

  export let taskTrees: TaskTree[];
</script>

<ul class="todoist-task-list">
  {#each taskTrees as taskTree (taskTree.id)}
    <TaskRenderer {taskTree} />
  {/each}
</ul>
