<script lang="ts">
  import { setIcon } from "obsidian";
  import { onMount } from "svelte";

  export let iconId: string;
  export let size: number | undefined = undefined;

  let clazz: string | undefined = undefined;
  export { clazz as class };

  let containerEl: HTMLDivElement;

  onMount(() => {
    setIcon(containerEl, iconId, size);
  });
</script>

<div bind:this={containerEl} class={clazz} />

<style>
  div {
    display: flex;
    align-items: center;
  }
</style>
