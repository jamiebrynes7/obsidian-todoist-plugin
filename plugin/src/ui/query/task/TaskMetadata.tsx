import { DueDate } from "@/data/dueDate";
import { formatDueDate } from "@/data/dueDateFormatter";
import type { Task } from "@/data/task";
import { type Query, ShowMetadataVariant } from "@/query/query";
import type { Settings } from "@/settings";
import { ObsidianIcon } from "@/ui/components/obsidian-icon";
import type React from "react";

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
  isShown: (query: Query, task: Task) => boolean;
  content: (task: Task) => MetadataContent[];
  icons: Partial<Record<IconOrientation, IconDefinition>>;
  side: "left" | "right";
};

const projectMeta: MetadataDefinition = {
  name: "project",
  isShown: (query, task) => query.show.has(ShowMetadataVariant.Project),
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
      shouldRender: (settings, task) => settings.renderProjectIcon,
    },
  },
  side: "right",
};

const dueDateMeta: MetadataDefinition = {
  name: "due",
  isShown: (query, task) => query.show.has(ShowMetadataVariant.Due) && task.due !== undefined,
  content: (task) => [{ content: dateLabel(task) }],
  icons: {
    before: {
      id: "calendar",
      shouldRender: (settings, task) => settings.renderDateIcon,
    },
    after: {
      id: "refresh-cw",
      shouldRender: (settings, task) => settings.renderDateIcon && (task.due?.isRecurring ?? false),
      size: "xs",
    },
  },
  side: "left",
};

const labelsMeta: MetadataDefinition = {
  name: "labels",
  isShown: (query, task) => query.show.has(ShowMetadataVariant.Labels) && task.labels.length > 0,
  content: (task) =>
    task.labels.map((label) => ({
      content: label.name,
      attr: { "data-label-color": label.color.replace("_", "-") },
    })),
  icons: {
    before: {
      id: "tag",
      shouldRender: (settings, task) => settings.renderLabelsIcon,
    },
  },
  side: "left",
};

const metadata: MetadataDefinition[] = [projectMeta, dueDateMeta, labelsMeta];

const dateLabel = (task: Task): string => {
  if (task.due === undefined) {
    return "";
  }

  return formatDueDate(new DueDate(task.due));
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
