<script lang="ts">
  import type { Task } from "../data/task";
  import { groupBy } from "../data/transformations/grouping";
  import TaskListRoot from "./TaskListRoot.svelte";
  import type { GroupVariant } from "../query/query";

  export let variant: GroupVariant;
  export let tasks: Task[];

  $: grouped = groupBy(tasks, variant);
</script>

{#each grouped as group (group.header)}
  <div class="todoist-group">
    <div class="todoist-group-title">
      {group.header}
    </div>
    <TaskListRoot tasks={group.tasks} />
  </div>
{/each}
