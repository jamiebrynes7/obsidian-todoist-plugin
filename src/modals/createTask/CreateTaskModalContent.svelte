<script lang="ts">
  import type { Moment } from "moment";
  import { Notice } from "obsidian";
  import { onMount, tick } from "svelte";
  import DateSelector from "./DateSelector.svelte";
  import LabelSelector from "./LabelSelector.svelte";
  import PriorityPicker from "./PriorityPicker.svelte";
  import ProjectSelector from "./ProjectSelector.svelte";
  import type { LabelOption, ProjectOption } from "./types";
  import type { TodoistAdapter } from "../../data";
  import type { CreateTaskParams } from "../../api/domain/task";

  export let todoistAdapter: TodoistAdapter;
  export let close: () => void;
  export let value: string;
  export let initialCursorPosition: number | undefined;

  let description: string = "";
  let activeLabels: LabelOption[] = [];
  let activeProject: ProjectOption | undefined = undefined;
  let date: Moment | undefined = undefined;
  let priority: number = 1;

  let inputEl: HTMLInputElement;

  let isBeingCreated: boolean = false;

  onMount(async () => {
    await tick();
    inputEl.focus();

    if (typeof initialCursorPosition != "undefined") {
      inputEl.setSelectionRange(initialCursorPosition, initialCursorPosition);
      inputEl.scrollLeft = 0;
    }
  });

  async function triggerClose() {
    if (isBeingCreated) {
      return;
    }

    isBeingCreated = true;

    let opts: CreateTaskParams = {
      description: description,
      priority: priority,
    };

    if (activeLabels) {
      opts.labels = activeLabels.map(({ label }) => label);
    }

    if (activeProject) {
      if (activeProject.value.type == "Project") {
        opts.projectId = activeProject.value.id;
      } else {
        opts.sectionId = activeProject.value.id;
      }
    }

    if (date) {
      opts.dueDate = date.format("YYYY-MM-DD");
    }

    try {
      await todoistAdapter.actions.createTask(value, opts);
      close();
      new Notice("Task created successfully.");
    } catch (error: any) {
      new Notice(`Failed to create task: '${error}'`);
    }

    isBeingCreated = false;
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key == "Enter") {
      triggerClose();
    }
  }
</script>

<svelte:window on:keydown={onKeyDown} />
<input bind:this={inputEl} type="text" bind:value placeholder="What to do?" />
<input type="text" bind:value={description} placeholder="Description..." />
<div>
  <div class="select">
    <span>Project</span>
    <div>
      <ProjectSelector bind:selected={activeProject} bind:todoistAdapter />
    </div>
  </div>
  <div class="select">
    <span>Labels</span>
    <div>
      <LabelSelector bind:selected={activeLabels} bind:todoistAdapter />
    </div>
  </div>
  <div class="select">
    <span>Date</span>
    <div>
      <DateSelector bind:selected={date} />
    </div>
  </div>
  <div class="select">
    <span>Priority</span>
    <div>
      <PriorityPicker bind:selected={priority} />
    </div>
  </div>
</div>
<button on:click={triggerClose} disabled={(value?.length ?? 0) == 0}>Add</button
>

<style>
  button {
    float: right;
    margin-top: 20px;
  }

  .select {
    --border: 1px solid var(--background-primary-alt);
    --border-hover: var(--interactive-accent);
    --border-focus: var(--interactive-accent);

    --background: var(--background-modifier-form-field);
    --list-background: var(--background-primary);

    --item-is-active-bg: var(--background-secondary);
    --item-is-active-color: var(--text-normal);
    --item-hover-bg: var(--background-secondary);
    --item-color: var(--text-normal);

    --multi-item-bg: var(--background-secondary);
    --multi-item-active-color: var(--text-normal);
    --multi-item-active-bg: var(--background-secondary-alt);

    margin-top: 0.5em;
    display: flex;
    align-items: center;
  }

  .select > span {
    width: 4em;
  }

  .select > div {
    flex-grow: 1;
  }

  input {
    width: 100%;
    margin-bottom: 0.5em;
    line-height: 42px;
  }
</style>
