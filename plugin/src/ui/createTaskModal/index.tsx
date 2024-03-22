import { CalendarDate } from "@internationalized/date";
import { Notice, TFile } from "obsidian";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "react-aria-components";
import type TodoistPlugin from "../..";
import type { Label } from "../../api/domain/label";
import type { Priority } from "../../api/domain/task";
import { useModalContext } from "../context/modal";
import { usePluginContext } from "../context/plugin";
import { DueDateSelector } from "./DueDateSelector";
import { LabelSelector } from "./LabelSelector";
import { PrioritySelector } from "./PrioritySelector";
import { type ProjectIdentifier, ProjectSelector } from "./ProjectSelector";
import { TaskContentInput } from "./TaskContentInput";
import "./styles.scss";

export type TaskCreationOptions = {
  appendLinkToContent: boolean;
  appendLinkToDescription: boolean;
};

type CreateTaskProps = {
  initialContent: string;
  fileContext: TFile | undefined;
  options: TaskCreationOptions;
};

export const CreateTaskModal: React.FC<CreateTaskProps> = (props) => {
  const plugin = usePluginContext();

  const [isReady, setIsReady] = useState(plugin.services.todoist.isReady());

  const refreshIsReady = () => {
    if (isReady) {
      return;
    }

    setIsReady(plugin.services.todoist.isReady());
  };

  // We don't want to reset this when isReady changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    const id = window.setInterval(refreshIsReady, 500);
    return () => window.clearInterval(id);
  }, []);

  if (!isReady) {
    return <div className="task-creation-modal-root">Loading Todoist data...</div>;
  }

  return <CreateTaskModalContent {...props} />;
};

const CreateTaskModalContent: React.FC<CreateTaskProps> = ({
  initialContent,
  fileContext,
  options: initialOptions,
}) => {
  const plugin = usePluginContext();
  const modal = useModalContext();

  const [content, setContent] = useState(initialContent);
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<CalendarDate | undefined>(undefined);
  const [priority, setPriority] = useState<Priority>(1);
  const [labels, setLabels] = useState<Label[]>([]);
  const [project, setProject] = useState<ProjectIdentifier>(getDefaultProject(plugin));

  const [options, setOptions] = useState<TaskCreationOptions>(initialOptions);

  const isSubmitButtonDisabled = content === "" && !options.appendLinkToContent;

  const buildWithLink = (initial: string, withLink: boolean) => {
    const builder = [initial];
    if (withLink && fileContext !== undefined) {
      builder.push(" ");
      if (plugin.options.shouldWrapLinksInParens) {
        builder.push("(");
      }
      builder.push(getLinkForFile(fileContext));
      if (plugin.options.shouldWrapLinksInParens) {
        builder.push(")");
      }
    }

    return builder.join("");
  };

  const createTask = async () => {
    await plugin.services.todoist.actions.createTask(
      buildWithLink(content, options.appendLinkToContent),
      {
        description: buildWithLink(description, options.appendLinkToDescription),
        dueDate: dueDate?.toString(),
        priority: priority,
        labels: labels.map((l) => l.name),
        projectId: project.projectId,
        sectionId: project.sectionId,
      },
    );
    modal.close();
  };

  return (
    <div className="task-creation-modal-root">
      <TaskContentInput
        className="task-name"
        placeholder="Task name"
        content={content}
        onChange={setContent}
        autofocus={true}
      />
      <TaskContentInput
        className="task-description"
        placeholder="Description"
        content={description}
        onChange={setDescription}
      />
      <div className="task-creation-selectors">
        <DueDateSelector selected={dueDate} setSelected={setDueDate} />
        <PrioritySelector selected={priority} setSelected={setPriority} />
        <LabelSelector selected={labels} setSelected={setLabels} />
      </div>
      <div className="task-creation-notes">
        <ul>
          {options.appendLinkToContent && (
            <li>A link to this page will be appended to the task name</li>
          )}
          {options.appendLinkToDescription && (
            <li>A link to this page will be appended to the task description</li>
          )}
        </ul>
      </div>
      <hr />
      <div className="task-creation-controls">
        <div>
          <ProjectSelector selected={project} setSelected={setProject} />
        </div>
        <div className="task-creation-action">
          <Button onPress={() => modal.close()} aria-label="Cancel">
            Cancel
          </Button>
          <Button
            className="mod-cta"
            isDisabled={isSubmitButtonDisabled}
            onPress={createTask}
            aria-label="Add task"
          >
            Add task
          </Button>
        </div>
      </div>
    </div>
  );
};

const getDefaultProject = (plugin: TodoistPlugin): ProjectIdentifier => {
  const { todoist } = plugin.services;
  const projects = Array.from(todoist.data().projects.iter());

  for (const project of projects) {
    if (project.isInboxProject) {
      return {
        projectId: project.id,
      };
    }
  }

  new Notice("Error: could not find inbox project");
  throw Error("Could not find inbox project");
};

const getLinkForFile = (file: TFile): string => {
  const vault = encodeURIComponent(file.vault.getName());
  const filepath = encodeURIComponent(file.path);

  return `[${file.name}](obsidian://open?vault=${vault}&file=${filepath})`;
};
