<script lang="ts">
  import type { Moment } from "moment";
  import { Notice } from "obsidian";

  import { onMount, tick } from "svelte";
  import type {
    ICreateTaskOptions,
    ITodoistMetadata,
    TodoistApi,
  } from "../../api/api";
  import DateSelector from "./DateSelector.svelte";
  import LabelSelector from "./LabelSelector.svelte";
  import ProjectSelector from "./ProjectSelector.svelte";
  import type { LabelOption, ProjectOption } from "./types";

  export let api: TodoistApi;
  export let close: () => void;

  export let value: string;
  let activeLabels: LabelOption[] = null;
  let activeProject: ProjectOption = null;
  let date: Moment = null;

  let inputEl: HTMLInputElement;

  let metadata: ITodoistMetadata;
  api.metadata.subscribe((value) => (metadata = value));

  onMount(async () => {
    await tick();
    inputEl.focus();
  });

  async function triggerClose() {
    let opts: ICreateTaskOptions = {};

    if (activeLabels) {
      opts.label_ids = activeLabels.map((label) => label.value);
    }

    if (activeProject) {
      if (activeProject.value.type == "Project") {
        opts.project_id = activeProject.value.id;
      } else {
        opts.section_id = activeProject.value.id;
      }
    }

    if (date) {
      opts.due_date = date.format("YYYY-MM-DD");
    }

    const result = await api.createTask(value, opts);

    if (result.isOk()) {
      close();
      new Notice("Task created successfully.");
    } else {
      new Notice(`Failed to create task: '${result.unwrapErr().message}'`);
    }
  }
</script>

<style>
  button {
    float: right;
    margin-top: 20px;
  }

  .select {
    --border: 1px solid var(--background-primary-alt);
    --borderHoverColor: var(--interactive-accent);
    --borderFocusColor: var(--interactive-accent);

    --background: var(--background-modifier-form-field);
    --listBackground: var(--background-modifier-form-field);

    --itemIsActiveBG: var(--menu-selection);
    --itemIsActiveColor: var(--menu-selection-text);
    --itemHoverBG: var(--background-modifier-form-field-highlighted);
    --itemColor: var(--text-normal);

    --multiItemBG: var(--menu-selection);
    --multiItemActiveBG: var(--menu-selection);

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

<input bind:this={inputEl} type="text" bind:value placeholder="What to do?" />
<div>
  <div class="select">
    <span>Project</span>
    <div>
      <ProjectSelector bind:selected={activeProject} bind:metadata />
    </div>
  </div>
  <div class="select">
    <span>Labels</span>
    <div>
      <LabelSelector bind:selected={activeLabels} bind:metadata />
    </div>
  </div>
  <div class="select">
    <span>Date</span>
    <div>
      <DateSelector bind:selected={date} />
    </div>
  </div>
</div>
<button on:click={triggerClose}>Add</button>
