<script lang="ts">
  import type { Task } from "../data/task";
  import { groupByProject } from "../data/transformations";
  import TaskListRoot from "./TaskListRoot.svelte";

  export let tasks: Task[];
  export let sorting: string[];

  $: grouped = groupByProject(tasks).sort(
    (first, second) => first.project.order - second.project.order
  );
</script>

<!-- TODO: Add folding? -->
{#each grouped as group (group.project.id)}
  <div class="todoist-project">
    <div class="todoist-project-title">
      {group.project.name}
    </div>
    <TaskListRoot tasks={group.tasks} {sorting} renderProject={false} />
  </div>
{/each}
