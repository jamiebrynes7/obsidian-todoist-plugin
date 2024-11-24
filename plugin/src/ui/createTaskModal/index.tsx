import { t } from "@/i18n";
import { timezone } from "@/infra/time";
import { useSettingsStore } from "@/settings";
import { ModalContext, PluginContext } from "@/ui/context";
import { toCalendarDateTime, toZoned } from "@internationalized/date";
import { Notice, type TFile } from "obsidian";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "react-aria-components";
import type TodoistPlugin from "../..";
import type { Label } from "../../api/domain/label";
import type { CreateTaskParams, Priority } from "../../api/domain/task";
import { type DueDate, DueDateSelector } from "./DueDateSelector";
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
  const plugin = PluginContext.use();

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

  const i18n = t().createTaskModal;

  if (!isReady) {
    return <div className="task-creation-modal-root">{i18n.loadingMessage}</div>;
  }

  return <CreateTaskModalContent {...props} />;
};

const CreateTaskModalContent: React.FC<CreateTaskProps> = ({
  initialContent,
  fileContext,
  options: initialOptions,
}) => {
  const plugin = PluginContext.use();
  const settings = useSettingsStore();
  const modal = ModalContext.use();

  const [content, setContent] = useState(initialContent);
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<DueDate | undefined>(undefined);
  const [priority, setPriority] = useState<Priority>(1);
  const [labels, setLabels] = useState<Label[]>([]);
  const [project, setProject] = useState<ProjectIdentifier>(getDefaultProject(plugin));

  const [options, setOptions] = useState<TaskCreationOptions>(initialOptions);

  const isSubmitButtonDisabled = content === "" && !options.appendLinkToContent;

  const i18n = t().createTaskModal;

  const buildWithLink = (initial: string, withLink: boolean) => {
    const builder = [initial];
    if (withLink && fileContext !== undefined) {
      builder.push(" ");
      if (settings.shouldWrapLinksInParens) {
        builder.push("(");
      }
      builder.push(getLinkForFile(fileContext));
      if (settings.shouldWrapLinksInParens) {
        builder.push(")");
      }
    }

    return builder.join("");
  };

  const createTask = async () => {
    if (isSubmitButtonDisabled) {
      return;
    }

    modal.close();

    const params: CreateTaskParams = {
      description: buildWithLink(description, options.appendLinkToDescription),
      priority: priority,
      labels: labels.map((l) => l.name),
      projectId: project.projectId,
      sectionId: project.sectionId,
    };

    if (dueDate !== undefined) {
      if (dueDate.time !== undefined) {
        params.dueDatetime = toZoned(
          toCalendarDateTime(dueDate.date, dueDate.time),
          timezone(),
        ).toAbsoluteString();
      } else {
        params.dueDate = dueDate.date.toString();
      }
    }

    try {
      await plugin.services.todoist.actions.createTask(
        buildWithLink(content, options.appendLinkToContent),
        params,
      );
      new Notice(i18n.successNotice);
    } catch (err) {
      new Notice(i18n.errorNotice);
      console.error("Failed to create task", err);
    }
  };

  return (
    <div className="task-creation-modal-root">
      <TaskContentInput
        className="task-name"
        placeholder={i18n.taskNamePlaceholder}
        content={content}
        onChange={setContent}
        autofocus={true}
        onEnterKey={createTask}
      />
      <TaskContentInput
        className="task-description"
        placeholder={i18n.descriptionPlaceholder}
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
          {options.appendLinkToContent && <li>{i18n.appendedLinkToContentMessage}</li>}
          {options.appendLinkToDescription && <li>{i18n.appendedLinkToDescriptionMessage}</li>}
        </ul>
      </div>
      <hr />
      <div className="task-creation-controls">
        <div>
          <ProjectSelector selected={project} setSelected={setProject} />
        </div>
        <div className="task-creation-action">
          <Button onPress={() => modal.close()} aria-label={i18n.cancelButtonLabel}>
            {i18n.cancelButtonLabel}
          </Button>
          <Button
            className="mod-cta"
            isDisabled={isSubmitButtonDisabled}
            onPress={createTask}
            aria-label={i18n.addTaskButtonLabel}
          >
            {i18n.addTaskButtonLabel}
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

  const i18n = t().createTaskModal;

  new Notice(i18n.failedToFindInboxNotice);
  throw Error("Could not find inbox project");
};

const getLinkForFile = (file: TFile): string => {
  const vault = encodeURIComponent(file.vault.getName());
  const filepath = encodeURIComponent(file.path);

  return `[${file.name}](obsidian://open?vault=${vault}&file=${filepath})`;
};
