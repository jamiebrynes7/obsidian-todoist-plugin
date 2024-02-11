<script lang="ts">
  import Select from "svelte-select";
  import type { LabelOption } from "./types";
  import type { TodoistAdapter } from "../../data";

  export let selected: LabelOption[];
  export let todoistAdapter: TodoistAdapter;

  $: labels = createLabelOptions();

  function createLabelOptions(): LabelOption[] {
    return Array.from(todoistAdapter.data().labels.iter())
      .sort((first, second) => first.name.localeCompare(second.name))
      .map((label) => {
        return {
          value: label.id,
          label: label.name,
        };
      });
  }
</script>

<Select
  items={labels}
  bind:value={selected}
  multiple={true}
  placeholder="Select labels..."
/>
