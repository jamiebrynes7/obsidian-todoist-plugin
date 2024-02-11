<script lang="ts">
  import MarkdownRenderer from "../components/MarkdownRenderer.svelte";

  export let description: string;

  $: isComplex =
    description.contains("\n") ||
    description.startsWith("#") ||
    description.startsWith("*") ||
    description.startsWith("-") ||
    description.startsWith("1.");

  $: isExpandedContent = !isComplex;

  function toggleExpandedContent() {
    if (!isComplex) {
      return;
    }

    isExpandedContent = !isExpandedContent;
  }
</script>

<div class="todoist-task-description" on:dblclick={toggleExpandedContent}>
  {#if isExpandedContent}
    <MarkdownRenderer content={description} />
  {:else}
    <span>{description.split("\n")[0]}...</span>
  {/if}
</div>
