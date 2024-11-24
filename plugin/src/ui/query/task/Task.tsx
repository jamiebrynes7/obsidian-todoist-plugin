import { DueDate } from "@/data/dueDate";
import type { TaskTree } from "@/data/transformations/relationships";
import { t } from "@/i18n";
import { ShowMetadataVariant } from "@/query/query";
import { useSettingsStore } from "@/settings";
import Markdown from "@/ui/components/markdown";
import { PluginContext, QueryContext } from "@/ui/context";
import { TaskList } from "@/ui/query/task/TaskList";
import { TaskMetadata } from "@/ui/query/task/TaskMetadata";
import { showTaskContext } from "@/ui/query/task/contextMenu";
import { motion } from "framer-motion";
import { Notice } from "obsidian";
import React, { type MouseEvent } from "react";
import { Checkbox } from "react-aria-components";

type Props = {
  tree: TaskTree;
};

export const Task: React.FC<Props> = ({ tree }) => {
  const plugin = PluginContext.use();
  const query = QueryContext.use();
  const settings = useSettingsStore();

  const onContextMenu = (ev: MouseEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    showTaskContext({ task: tree, plugin }, { x: ev.pageX, y: ev.pageY });
  };

  const onClickTask = async () => {
    try {
      await plugin.services.todoist.actions.closeTask(tree.id);
    } catch (error: unknown) {
      console.error("Failed to close task", error);
      new Notice(t().query.failedCloseMessage, 2000);
    }
  };

  const isDisabled = tree.content.startsWith("*");

  const shouldRenderDescription =
    query.show.has(ShowMetadataVariant.Description) && tree.description !== "";

  const transitionOpacity = settings.fadeToggle ? 0 : 1;

  return (
    <>
      <motion.div
        className="todoist-task-container"
        onContextMenu={onContextMenu}
        data-priority={tree.priority}
        data-due-metadata={getDueMetadataInfo(tree)}
        data-has-time={getTimeMetadataInfo(tree)}
        initial={{ opacity: transitionOpacity }}
        animate={{ opacity: 1 }}
        exit={{ opacity: transitionOpacity }}
        transition={{ duration: 0.4 }}
      >
        <Checkbox
          className="todoist-task-checkbox"
          isDisabled={isDisabled}
          isSelected={false}
          onChange={onClickTask}
        >
          <div />
        </Checkbox>
        <div className="todoist-task">
          <Markdown className="todoist-task-content" content={sanitizeContent(tree.content)} />
          {shouldRenderDescription && <DescriptionRenderer content={tree.description} />}
          <TaskMetadata query={query} task={tree} settings={settings} />
        </div>
      </motion.div>
      {tree.children.length > 0 && <TaskList trees={tree.children} />}
    </>
  );
};

function getDueMetadataInfo(task: TaskTree): string | undefined {
  if (task.due === undefined) {
    return undefined;
  }

  const info = new DueDate(task.due);

  if (info.isOverdue()) {
    return "overdue";
  }
  if (info.isToday()) {
    return "today";
  }
  if (info.isTomorrow()) {
    return "tomorrow";
  }

  return undefined;
}

function getTimeMetadataInfo(task: TaskTree): boolean | undefined {
  if (task.due === undefined) {
    return undefined;
  }

  return new DueDate(task.due).hasTime();
}

const sanitizeContent = (content: string): string => {
  // Escape leading '#' or '-' so they aren't rendered as headers/bullets.
  if (content.startsWith("#") || content.startsWith("-")) {
    return `\\${content}`;
  }

  // A task starting with '*' signifies that it cannot be completed, so we should strip it from the front of the task.
  if (content.startsWith("*")) {
    return content.substring(1);
  }

  return content;
};

type DescriptionRendererProps = {
  content: string;
};

const DescriptionRenderer: React.FC<DescriptionRendererProps> = ({ content }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const isComplex =
    content.includes("\n") ||
    content.startsWith("#") ||
    content.startsWith("*") ||
    content.startsWith("-") ||
    content.startsWith("1.");

  const toggleExpanded = () => {
    if (!isComplex) {
      return;
    }

    setIsExpanded(!isExpanded);
  };

  const renderFullMarkdown = isExpanded || !isComplex;

  return (
    <div onDoubleClick={toggleExpanded} className="todoist-task-description">
      {renderFullMarkdown ? (
        <Markdown content={content} />
      ) : (
        <span>{content.split("\n")[0]}...</span>
      )}
    </div>
  );
};
