<script lang="ts">
  import { onDestroy } from "svelte";
  import {
    ITodoistMetadata,
    TodoistApi,
    UnknownProject,
    UnknownSection,
  } from "../api/api";
  import type { Project } from "../api/models";
  import TaskList from "./TaskList.svelte";
  import type { ISettings } from "../settings";

  export let project: Project;
  export let api: TodoistApi;
  export let settings: ISettings;
  export let sorting: string[];

  let metadata: ITodoistMetadata = null;
  const metadataUnsub = api.metadata.subscribe((value) => (metadata = value));

  onDestroy(() => {
    metadataUnsub();
  });
</script>

<h2>
  {metadata.projects.get_or(project.projectID, () => UnknownProject).name}
</h2>
<TaskList tasks={project.tasks} {settings} {api} {sorting} />

{#each project.sections as section (section.sectionID)}
  <h4>
    {metadata.sections.get_or(section.sectionID, () => UnknownSection).name}
  </h4>
  <TaskList tasks={section.tasks} {settings} {api} {sorting} />
{/each}

{#each project.subProjects as childProj (childProj.projectID)}
  <svelte:self project={childProj} {settings} {api} {sorting} />
{/each}
