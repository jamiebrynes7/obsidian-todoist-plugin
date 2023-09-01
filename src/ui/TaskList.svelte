<script lang="ts">
  import type { TaskTree } from "../data/transformations";
  import TaskRenderer from "./TaskRenderer.svelte";

  export let taskTrees: TaskTree[];
  export let renderProject: boolean;
</script>

<ul class="todoist-task-list">
  {#each taskTrees as taskTree (taskTree.id)}
    <TaskRenderer {taskTree} {renderProject} />
  {/each}
</ul>
