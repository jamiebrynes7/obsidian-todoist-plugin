import { DueDateInfo } from "@/data/dueDateInfo";
import type { Task } from "@/data/task";
import { type Query, ShowMetadataVariant } from "@/query/query";
import type { Settings } from "@/settings";
import { ObsidianIcon } from "@/ui/components/obsidian-icon";
import type { CalendarSpec } from "moment";
import React from "react";

type MetadataDefinition = {
  name: string;
  isShown: (query: Query, task: Task) => boolean;
  content: (task: Task) => string;
  icon: {
    id: string;
    shouldRender: (setting: Settings) => boolean;
    orientation: "before" | "after";
  };
  side: "left" | "right";
};

const metadata: MetadataDefinition[] = [
  {
    name: "project",
    isShown: (query, task) => query.show.has(ShowMetadataVariant.Project),
    content: (task) =>
      task.section === undefined
        ? task.project.name
        : `${task.project.name} / ${task.section.name}`,
    icon: {
      id: "hash",
      shouldRender: (settings) => settings.renderProjectIcon,
      orientation: "after",
    },
    side: "right",
  },
  {
    name: "due",
    isShown: (query, task) => query.show.has(ShowMetadataVariant.Due) && task.due !== undefined,
    content: (task) => dateLabel(task),
    icon: {
      id: "calendar",
      shouldRender: (settings) => settings.renderDateIcon,
      orientation: "before",
    },
    side: "left",
  },
  {
    name: "labels",
    isShown: (query, task) => query.show.has(ShowMetadataVariant.Labels) && task.labels.length > 0,
    content: (task) => task.labels.join(", "),
    icon: {
      id: "tag",
      shouldRender: (settings) => settings.renderLabelsIcon,
      orientation: "before",
    },
    side: "left",
  },
];

const dateLabel = (task: Task): string => {
  const info = new DueDateInfo(task.due);
  if (!info.hasDueDate()) {
    return "";
  }

  const m = info.moment();

  if (info.hasTime()) {
    return m.calendar();
  }

  return m.calendar(dateOnlyCalendarSpec);
};

const dateOnlyCalendarSpec: CalendarSpec = {
  sameDay: "[Today]",
  nextDay: "[Tomorrow]",
  nextWeek: "dddd",
  lastDay: "[Yesterday]",
  lastWeek: "[Last] dddd",
  sameElse: "MMM Do",
};

type TaskMetadataProps = {
  query: Query;
  settings: Settings;
  task: Task;
};

export const TaskMetadata: React.FC<TaskMetadataProps> = (props) => {
  const leftMetadata = getMetadataElems(props, "left");
  const rightMetadata = getMetadataElems(props, "right");

  return (
    <div className="todoist-task-metadata">
      <div>{leftMetadata}</div>
      <div>{rightMetadata}</div>
    </div>
  );
};

const getMetadataElems = (
  props: TaskMetadataProps,
  side: MetadataDefinition["side"],
): JSX.Element[] => {
  const { query, task, settings } = props;

  return metadata
    .filter((meta) => meta.side === side)
    .filter((meta) => meta.isShown(query, task))
    .map((meta) => {
      const content = <span>{meta.content(task)}</span>;
      const icon = meta.icon.shouldRender(settings) ? (
        <ObsidianIcon id={meta.icon.id} size={16} />
      ) : undefined;

      const children = [icon, content];
      if (meta.icon.orientation === "after") {
        children.reverse();
      }

      return (
        <div className="task-metadata-item" key={meta.name} data-task-metadata-kind={meta.name}>
          {children}
        </div>
      );
    });
};
