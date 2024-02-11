<script lang="ts">
  import { MarkdownRenderer } from "obsidian";
  import { onMount } from "svelte";
    import { getComponent } from "../ui/contexts";

  export let content: string;

  let clazz: string | undefined = undefined;
  export { clazz as class };

  let containerEl: HTMLDivElement;

  const component = getComponent();

  onMount(async () => {
    await MarkdownRenderer.renderMarkdown(content, containerEl, "", component);

    if (containerEl.childElementCount > 1) {
      return;
    }

    const markdownContent = containerEl.querySelector("p");

    if (markdownContent !== null) {
      markdownContent.parentElement?.removeChild(markdownContent);
      containerEl.innerHTML = markdownContent.innerHTML;
    }
  });
</script>

<div bind:this={containerEl} class={clazz} />
