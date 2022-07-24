<script lang="ts">
  import { onDestroy } from "svelte";
  import type { ITodoistMetadata, TodoistApi } from "../api/api";
  import type { Project } from "../api/models";
  import { UnknownProject, UnknownSection } from "../api/raw_models";
  import TaskList from "./TaskList.svelte";
  import type { ISettings } from "../settings";
  import CollapseIndicator from "../components/CollapseIndicator.svelte";

  export let project: Project;
  export let api: TodoistApi;
  export let settings: ISettings;
  export let sorting: string[];

  let metadata: ITodoistMetadata = null;
  const metadataUnsub = api.metadata.subscribe((value) => (metadata = value));

  let foldedState: Map<number, boolean> = new Map();

  foldedState.set(project.projectID, false);
  project.sections.forEach((s) => foldedState.set(s.sectionID, false));

  function toggleFold(id: number) {
    foldedState.set(id, !foldedState.get(id));
    foldedState = foldedState;
  }

  onDestroy(() => {
    metadataUnsub();
  });
</script>

<div class="todoist-project">
  <div
    class="{foldedState.get(project.projectID) ? 'is-collapsed' : ''} todoist-project-title"
    on:click={() => toggleFold(project.projectID)}>
    <CollapseIndicator />
    <span>
      {metadata.projects.get_or_default(project.projectID, UnknownProject).name}
    </span>
  </div>
  {#if !foldedState.get(project.projectID)}
    <TaskList
      tasks={project.tasks}
      {settings}
      {api}
      {sorting}
      renderProject={false}
      renderNoTaskInfo={false} />

    {#each project.sections as section (section.sectionID)}
      <div class="todoist-section">
        <div
          class="{foldedState.get(section.sectionID) ? 'is-collapsed' : ''} todoist-section-title"
          on:click={() => toggleFold(section.sectionID)}>
          <CollapseIndicator />
          <span>
            {metadata.sections.get_or_default(section.sectionID, UnknownSection).name}
          </span>
        </div>
        {#if !foldedState.get(section.sectionID)}
          <TaskList
            tasks={section.tasks}
            {settings}
            {api}
            {sorting}
            renderProject={false}
            renderNoTaskInfo={false} />
        {/if}
      </div>
    {/each}

    {#each project.subProjects as childProj (childProj.projectID)}
      <svelte:self project={childProj} {settings} {api} {sorting} />
    {/each}
  {/if}
</div>
