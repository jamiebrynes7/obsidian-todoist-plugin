<script lang="ts">
  import { MarkdownRenderer } from "obsidian";
  import { afterUpdate, onMount } from "svelte";

  export let description: string;

  let containerEl: HTMLDivElement;
  let isExpandedContent: boolean = false;

  $: isComplex =
    description.contains("\n") ||
    description.startsWith("#") ||
    description.startsWith("*") ||
    description.startsWith("-") ||
    description.startsWith("1.");

  onMount(async () => {
    if (containerEl === undefined) {
      return;
    }

    await MarkdownRenderer.renderMarkdown(description, containerEl, "", null);

    if (containerEl.childElementCount > 1) {
      return;
    }

    const markdownContent = containerEl.querySelector("p");

    if (markdownContent) {
      markdownContent.parentElement.removeChild(markdownContent);
      containerEl.innerHTML = markdownContent.innerHTML;
    }
  });

  function toggleExpandedContent() {
    isExpandedContent = !isExpandedContent;
  }
</script>

{#if isComplex}
  <div class="todoist-task-description" on:dblclick={toggleExpandedContent}>
    <div bind:this={containerEl} class={isExpandedContent ? "" : "hidden"} />
    <span class={isExpandedContent ? "hidden" : ""}
      >{description.split("\n")[0]}...</span
    >
  </div>
{:else}
  <div bind:this={containerEl} class="todoist-task-description" />
{/if}

<style>
  .hidden {
    display: none;
  }
</style>
