<script lang="ts">
  import { fade } from "svelte/transition";
  import CalendarIcon from "../components/icons/CalendarIcon.svelte";
  import LabelIcon from "../components/icons/LabelIcon.svelte";
  import ProjectIcon from "../components/icons/ProjectIcon.svelte";
  import MarkdownRenderer from "../components/MarkdownRenderer.svelte";
  import { showTaskContext } from "../contextMenu";
  import { settings } from "../settings";
  import DescriptionRenderer from "./DescriptionRenderer.svelte";
  import TaskList from "./TaskList.svelte";
  import type { TaskTree } from "../data/transformations";
  import { getDueDateInfo, type DueDateInfo } from "../api/domain/dueDate";
  import type { CalendarSpec } from "moment";
  import { getTaskActions } from "./contexts";

  const dateOnlyCalendarSpec: CalendarSpec = {
    sameDay: "[Today]",
    nextDay: "[Tomorrow]",
    nextWeek: "dddd",
    lastDay: "[Yesterday]",
    lastWeek: "[Last] dddd",
    sameElse: "MMM Do",
  };

  export let renderProject: boolean;
  export let taskTree: TaskTree;

  const taskActions = getTaskActions();

  $: isCompletable = !taskTree.content.startsWith("*");
  $: dateInfo = getDueDateInfo(taskTree.due);

  $: dateLabel = getDueDateLabel(dateInfo);
  $: projectLabel = getProjectLabel(taskTree);
  $: labels = taskTree.labels.join(", ");
  $: sanitizedContent = sanitizeContent(taskTree.content);

  $: shouldRenderProject = $settings.renderProject && renderProject;
  $: shouldRenderDueDate = $settings.renderDate && taskTree.due !== undefined;
  $: shouldRenderLabels = $settings.renderLabels && taskTree.labels.length != 0;

  $: priorityClass = getPriorityClass(taskTree.priority);
  $: dateTimeClass = getDateTimeClass(dateInfo);

  function getDueDateLabel(info: DueDateInfo): string {
    if (info.hasTime) {
      return info.m.calendar();
    }

    return info.m.calendar(dateOnlyCalendarSpec);
  }

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

  function getDateTimeClass(info: DueDateInfo): string {
    const parts = [];

    if (info.hasTime) {
      parts.push("has-time");
    } else {
      parts.push("no-time");
    }

    if (info.isOverdue) {
      parts.push("task-overdue");
    } else if (info.isToday) {
      parts.push("task-today");
    }

    return parts.join(" ");
  }

  function getProjectLabel(task: TaskTree): string {
    const projectName = task.project?.name ?? "Unknown Project";

    if (task.section === undefined) {
      return projectName;
    }

    const sectionName = task.section.name;

    return `${projectName} | ${sectionName}`;
  }

  function onClickTaskContainer(evt: MouseEvent) {
    evt.stopPropagation();
    evt.preventDefault();

    showTaskContext(
      {
        task: taskTree,
        closeTask: taskActions.close,
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
  transition:fade={{ duration: $settings.fadeToggle ? 400 : 0 }}
  class="task-list-item {priorityClass} {dateTimeClass}"
>
  <div class="todoist-task-container">
    <input
      disabled={!isCompletable}
      data-line="1"
      class="task-list-item-checkbox"
      type="checkbox"
      on:click|preventDefault={async () => {
        await taskActions.close(taskTree.id);
      }}
    />
    <MarkdownRenderer class="todoist-task-content" content={sanitizedContent} />
  </div>
  {#if $settings.renderDescription && taskTree.description != ""}
    <DescriptionRenderer description={taskTree.description} />
  {/if}
  <div class="task-metadata">
    {#if shouldRenderProject}
      <div class="task-project">
        {#if $settings.renderProjectIcon}
          <ProjectIcon class="task-project-icon" />
        {/if}
        {projectLabel}
      </div>
    {/if}
    {#if shouldRenderDueDate}
      <div class="task-date {dateTimeClass}">
        {#if $settings.renderDateIcon}
          <CalendarIcon class="task-calendar-icon" />
        {/if}
        {dateLabel}
      </div>
    {/if}
    {#if shouldRenderLabels}
      <div class="task-labels">
        {#if $settings.renderLabelsIcon}
          <LabelIcon class="task-labels-icon" />
        {/if}
        {labels}
      </div>
    {/if}
  </div>
  {#if taskTree.children.length != 0}
    <TaskList taskTrees={taskTree.children} {renderProject} />
  {/if}
</li>
