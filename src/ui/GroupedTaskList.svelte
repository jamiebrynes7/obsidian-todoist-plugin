<script lang="ts">
  import { onDestroy } from "svelte";
  import type { ITodoistMetadata, TodoistApi } from "../api/api";
  import type { Project } from "../api/models";
  import { UnknownProject, UnknownSection } from "../api/raw_models";
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

<div class="todoist-project">
  <p class="todoist-project-title">
    {metadata.projects.get_or_default(project.projectID, UnknownProject).name}
  </p>
  <TaskList
    tasks={project.tasks}
    {settings}
    {api}
    {sorting}
    renderProject={false}
    renderNoTaskInfo={false} />

  {#each project.sections as section (section.sectionID)}
    <div class="todoist-section">
      <p class="todoist-section-title">
        {metadata.sections.get_or_default(section.sectionID, UnknownSection).name}
      </p>
      <TaskList
        tasks={section.tasks}
        {settings}
        {api}
        {sorting}
        renderProject={false}
        renderNoTaskInfo={false} />
    </div>
  {/each}

  {#each project.subProjects as childProj (childProj.projectID)}
    <svelte:self project={childProj} {settings} {api} {sorting} />
  {/each}
</div>
