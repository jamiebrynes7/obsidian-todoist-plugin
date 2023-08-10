<script lang="ts">
  import { fade } from "svelte/transition";
  import type { ITodoistMetadata, TodoistApi } from "../api/api";
  import type { Task } from "../api/models";
  import { UnknownProject, UnknownSection } from "../api/raw_models";
  import CalendarIcon from "../components/icons/CalendarIcon.svelte";
  import LabelIcon from "../components/icons/LabelIcon.svelte";
  import ProjectIcon from "../components/icons/ProjectIcon.svelte";
  import MarkdownRenderer from "../components/MarkdownRenderer.svelte";
  import { showTaskContext } from "../contextMenu";
  import type { ISettings } from "../settings";
  import DescriptionRenderer from "./DescriptionRenderer.svelte";
  import TaskList from "./TaskList.svelte";

  export let metadata: ITodoistMetadata;
  export let settings: ISettings;
  export let api: TodoistApi;
  export let sorting: string[];
  export let renderProject: boolean;
  export let onClickTask: (task: Task) => Promise<void>;
  export let todo: Task;

  $: isCompletable = !todo.content.startsWith("*");
  $: priorityClass = getPriorityClass(todo.priority);
  $: dateTimeClass = getDateTimeClass(todo);
  $: projectLabel = getProjectLabel(todo, metadata);
  $: labels = todo.labels.join(", ");
  $: sanitizedContent = sanitizeContent(todo.content);

  function sanitizeContent(content: string): string {
    // Escape leading '#' or '-' so they aren't rendered as headers/bullets.
    if (content.startsWith("#") || content.startsWith("-")) {
      return `\\${content}`;
    }

    // A task starting with '*' signifies that it cannot be completed, so we should strip it from the front of the task.
    if (content.startsWith("*")) {
      return content.substring(1);
    }

    return content;
  }

  // For some reason, the Todoist API returns priority in reverse order from
  // the p1/p2/p3/p4 fluent entry notation.
  function getPriorityClass(priority: number): string {
    switch (priority) {
      case 1:
        return "todoist-p4";
      case 2:
        return "todoist-p3";
      case 3:
        return "todoist-p2";
      case 4:
        return "todoist-p1";
    }
  }

  function getDateTimeClass(todo: Task): string {
    const parts = [];

    if (todo.hasTime) {
      parts.push("has-time");
    } else {
      parts.push("no-time");
    }

    if (todo.isOverdue()) {
      parts.push("task-overdue");
    } else if (todo.isToday()) {
      parts.push("task-today");
    }

    return parts.join(" ");
  }

  function getProjectLabel(todo: Task, metadata: ITodoistMetadata): string {
    const project = metadata.projects.get_or_default(
      todo.projectID,
      UnknownProject
    ).name;

    if (todo.sectionID === null) {
      return project;
    }

    const section = metadata.sections.get_or_default(
      todo.sectionID,
      UnknownSection
    ).name;

    return `${project} | ${section}`;
  }

  function onClickTaskContainer(evt: MouseEvent) {
    evt.stopPropagation();
    evt.preventDefault();

    showTaskContext(
      {
        task: todo,
        onClickTask: onClickTask,
      },
      {
        x: evt.pageX,
        y: evt.pageY,
      }
    );
  }
</script>

<li
  on:contextmenu={onClickTaskContainer}
  transition:fade={{ duration: settings.fadeToggle ? 400 : 0 }}
  class="task-list-item {priorityClass} {dateTimeClass}"
>
  <div>
    <input
      disabled={!isCompletable}
      data-line="1"
      class="task-list-item-checkbox"
      type="checkbox"
      on:click|preventDefault={async () => {
        await onClickTask(todo);
      }}
    />
    <MarkdownRenderer class="todoist-task-content" content={sanitizedContent} />
  </div>
  {#if settings.renderDescription && todo.description != ""}
    <DescriptionRenderer description={todo.description} />
  {/if}
  <div class="task-metadata">
    {#if settings.renderProject && renderProject}
      <div class="task-project">
        {#if settings.renderProjectIcon}
          <ProjectIcon class="task-project-icon" />
        {/if}
        {projectLabel}
      </div>
    {/if}
    {#if settings.renderDate && todo.date}
      <div class="task-date {dateTimeClass}">
        {#if settings.renderDateIcon}
          <CalendarIcon class="task-calendar-icon" />
        {/if}
        {todo.date}
      </div>
    {/if}
    {#if settings.renderLabels && todo.labels.length > 0}
      <div class="task-labels">
        {#if settings.renderLabelsIcon}
          <LabelIcon class="task-labels-icon" />
        {/if}
        {labels}
      </div>
    {/if}
  </div>
  {#if todo.children.length != 0}
    <TaskList
      tasks={todo.children}
      {settings}
      {api}
      {sorting}
      {renderProject}
      renderNoTaskInfo={false}
    />
  {/if}
</li>
