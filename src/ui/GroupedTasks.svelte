<script lang="ts">
  import type { Task } from "../data/task";
  import { groupByProject } from "../data/transformations";
  import TaskListRoot from "./TaskListRoot.svelte";

  export let tasks: Task[];

  $: grouped = groupByProject(tasks).sort(
    (first, second) => first.project.order - second.project.order
  );
</script>

{#each grouped as group (group.project.id)}
  <div class="todoist-project">
    <div class="todoist-project-title">
      {group.project.name}
    </div>
    <TaskListRoot tasks={group.tasks} />
  </div>
{/each}
