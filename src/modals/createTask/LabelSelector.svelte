<script lang="ts">
  import Select from "svelte-select";
  import type { ITodoistMetadata } from "../../api/api";
  import type { LabelOption } from "./types";

  export let selected: LabelOption[];
  export let metadata: ITodoistMetadata;

  $: labels = createLabelOptions(metadata);

  function createLabelOptions(metadata: ITodoistMetadata): LabelOption[] {
    return Array.from(metadata.labels)
      .sort(([, first_name], [, second_name]) =>
        first_name.localeCompare(second_name)
      )
      .map(([id, label]) => {
        return {
          value: id,
          label: label,
        };
      });
  }
</script>

<Select
  items={labels}
  bind:selectedValue={selected}
  isMulti={true}
  placeholder="Select labels..."
  noOptionsMessage="No labels." />
