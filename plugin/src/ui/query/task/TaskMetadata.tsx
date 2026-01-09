import type React from "react";

import { Deadline } from "@/data/deadline";
import { DueDate } from "@/data/dueDate";
import type { Task } from "@/data/task";
import type { ShowMetadataKey } from "@/query/schema/show";
import type { TaskQuery } from "@/query/schema/tasks";
import type { Settings } from "@/settings";
import { ObsidianIcon } from "@/ui/components/obsidian-icon";

type MetadataContent = {
  content: string;
  attr?: Record<string, string>;
};

type IconDefinition = {
  id: string;
  shouldRender: (settings: Settings, task: Task) => boolean;
  size?: React.ComponentProps<typeof ObsidianIcon>["size"];
};

type IconOrientation = "before" | "after";

type MetadataDefinition = {
  name: string;
  isShown: (show: Set<ShowMetadataKey>, task: Task) => boolean;
  content: (task: Task) => MetadataContent[];
  icons: Partial<Record<IconOrientation, IconDefinition>>;
  side: "left" | "right";
};

const projectMeta: MetadataDefinition = {
  name: "project",
  isShown: (show) => show.has("project"),
  content: (task) => [
    {
      content:
        task.section === undefined
          ? task.project.name
          : `${task.project.name} / ${task.section.name}`,
      attr: {
        "data-project-color": task.project.color.replace("_", "-"),
      },
    },
  ],
  icons: {
    after: {
      id: "hash",
      shouldRender: (settings) => settings.renderProjectIcon,
    },
  },
  side: "right",
};

const sectionMeta: MetadataDefinition = {
  name: "section",
  isShown: (show, task) =>
    show.has("section") && !show.has("project") && task.section !== undefined,
  content: (task) => [
    {
      // biome-ignore lint/style/noNonNullAssertion: We enforce this above in 'isShown'.
      content: task.section!.name,
    },
  ],
  icons: {
    after: {
      id: "gallery-vertical",
      shouldRender: (settings) => settings.renderProjectIcon,
    },
  },
  side: "right",
};

const dueDateMeta: MetadataDefinition = {
  name: "due",
  isShown: (show, task) => (show.has("due") ?? false) && task.due !== undefined,
  content: (task) => [{ content: dateLabel(task) }],
  icons: {
    before: {
      id: "calendar",
      shouldRender: (settings) => settings.renderDateIcon,
    },
    after: {
      id: "refresh-cw",
      shouldRender: (settings, task) => settings.renderDateIcon && (task.due?.isRecurring ?? false),
      size: "xs",
    },
  },
  side: "left",
};

const deadlineMeta: MetadataDefinition = {
  name: "deadline",
  isShown: (show, task) => (show.has("deadline") ?? false) && task.deadline !== undefined,
  content: (task) => [{ content: deadlineLabel(task) }],
  icons: {
    before: {
      id: "target",
      shouldRender: (settings) => settings.renderDateIcon,
    },
  },
  side: "left",
};

const labelsMeta: MetadataDefinition = {
  name: "labels",
  isShown: (show, task) => (show.has("labels") ?? false) && task.labels.length > 0,
  content: (task) =>
    task.labels.map((label) => ({
      content: label.name,
      attr: {
        "data-label-color": label.color.replace("_", "-"),
      },
    })),
  icons: {
    before: {
      id: "tag",
      shouldRender: (settings) => settings.renderLabelsIcon,
    },
  },
  side: "left",
};

const timeOnlyMeta: MetadataDefinition = {
  name: "time",
  isShown: (show, task) => {
    if (show.has("due")) {
      return false;
    }

    if (!show.has("time") || task.due === undefined) {
      return false;
    }

    const parsedDue = DueDate.parse(task.due, task.duration);
    return parsedDue.start.hasTime;
  },
  content: (task) => [{ content: timeOnlyLabel(task) }],
  icons: {
    before: {
      id: "calendar",
      shouldRender: (settings) => settings.renderDateIcon,
    },
  },
  side: "left",
};

const metadata: MetadataDefinition[] = [
  projectMeta,
  sectionMeta,
  dueDateMeta,
  deadlineMeta,
  labelsMeta,
  timeOnlyMeta,
];

const dateLabel = (task: Task): string => {
  if (task.due === undefined) {
    return "";
  }

  return DueDate.format(DueDate.parse(task.due, task.duration));
};

const deadlineLabel = (task: Task): string => {
  if (task.deadline === undefined) {
    return "";
  }

  return Deadline.format(Deadline.parse(task.deadline));
};

const timeOnlyLabel = (task: Task): string => {
  if (task.due === undefined) {
    return "";
  }

  return DueDate.formatTimeOnly(DueDate.parse(task.due, task.duration)) ?? "";
};

type TaskMetadataProps = {
  query: TaskQuery;
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
): React.ReactElement[] => {
  const { query, task, settings } = props;

  const show =
    query.show ?? new Set<ShowMetadataKey>(["project", "due", "description", "labels", "deadline"]);

  return metadata
    .filter((meta) => meta.side === side)
    .filter((meta) => meta.isShown(show, task))
    .flatMap((meta) => {
      return meta.content(task).map((content) => {
        const children = [<span key="content">{content.content}</span>];

        for (const [orientation, iconDef] of Object.entries(meta.icons)) {
          if (iconDef.shouldRender(settings, task)) {
            const icon = (
              <ObsidianIcon key={iconDef.id} id={iconDef.id} size={iconDef.size ?? "s"} />
            );

            switch (orientation) {
              case "before":
                children.unshift(icon);
                break;
              case "after":
                children.push(icon);
                break;
              default:
                throw new Error(`Unknown icon orientation: ${orientation}`);
            }
          }
        }
        return (
          <div
            className="task-metadata-item"
            key={meta.name}
            data-task-metadata-kind={meta.name}
            {...content.attr}
          >
            {children}
          </div>
        );
      });
    });
};
