import { toCalendarDateTime, toZoned } from "@internationalized/date";
import { Notice, type TFile } from "obsidian";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "react-aria-components";

import { t } from "@/i18n";
import { timezone, today } from "@/infra/time";
import {
  type DueDateDefaultSetting,
  type ProjectDefaultSetting,
  useSettingsStore,
} from "@/settings";
import { ModalContext, PluginContext } from "@/ui/context";

import type TodoistPlugin from "../..";
import type { Label } from "../../api/domain/label";
import type { CreateTaskParams, Priority } from "../../api/domain/task";
import { type DueDate, DueDateSelector } from "./DueDateSelector";
import { LabelSelector } from "./LabelSelector";
import { PrioritySelector } from "./PrioritySelector";
import { type ProjectIdentifier, ProjectSelector } from "./ProjectSelector";
import { TaskContentInput } from "./TaskContentInput";
import "./styles.scss";

import type { Translations } from "@/i18n/translation";
import { OptionsSelector } from "@/ui/createTaskModal/OptionsSelector";
import { Setting } from "@/ui/settings/SettingItem";

export type LinkDestination = "content" | "description";

export type TaskCreationOptions = {
  appendLinkTo?: LinkDestination;
};

type CreateTaskProps = {
  initialContent: string;
  fileContext: TFile | undefined;
  options: TaskCreationOptions;
};

const getLinkDestinationMessage = (
  destination: LinkDestination | undefined,
  i18n: Translations["createTaskModal"],
): string | undefined => {
  switch (destination) {
    case "content":
      return i18n.appendedLinkToContentMessage;
    case "description":
      return i18n.appendedLinkToDescriptionMessage;
    default:
      return undefined;
  }
};

const calculateDefaultDueDate = (setting: DueDateDefaultSetting): DueDate | undefined => {
  switch (setting) {
    case "none":
      return undefined;
    case "today":
      return {
        date: today(),
        timeInfo: undefined,
      };
    case "tomorrow":
      return {
        date: today().add({ days: 1 }),
        timeInfo: undefined,
      };
  }
};

const calculateDefaultProject = (
  plugin: TodoistPlugin,
  projectSetting: ProjectDefaultSetting,
): ProjectIdentifier => {
  if (projectSetting === null) {
    return getInboxProject(plugin);
  }

  const project = plugin.services.todoist.data().projects.byId(projectSetting.projectId);
  if (project === undefined) {
    const noticeMsg = t().createTaskModal.defaultProjectDeletedNotice(projectSetting.projectName);
    new Notice(noticeMsg);
    return getInboxProject(plugin);
  }

  return {
    projectId: projectSetting.projectId,
  };
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: we don't want to reset this when isReady changes.
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
  const [dueDate, setDueDate] = useState<DueDate | undefined>(() =>
    calculateDefaultDueDate(settings.taskCreationDefaultDueDate),
  );
  const [priority, setPriority] = useState<Priority>(1);
  const [labels, setLabels] = useState<Label[]>([]);
  const [project, setProject] = useState<ProjectIdentifier>(
    calculateDefaultProject(plugin, settings.taskCreationDefaultProject),
  );

  const [options, setOptions] = useState<TaskCreationOptions>(initialOptions);
  const [useQuickAdd, setUseQuickAdd] = useState(settings.useQuickAddEndpoint);

  const isSubmitButtonDisabled = content === "" && options.appendLinkTo !== "content";

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
      description: buildWithLink(description, options.appendLinkTo === "description"),
      priority: priority,
      labels: labels.map((l) => l.name),
      projectId: project.projectId,
      sectionId: project.sectionId,
    };

    if (dueDate !== undefined) {
      if (dueDate.timeInfo !== undefined) {
        params.dueDatetime = toZoned(
          toCalendarDateTime(dueDate.date, dueDate.timeInfo.time),
          timezone(),
        ).toAbsoluteString();
      } else {
        params.dueDate = dueDate.date.toString();
      }
    }

    try {
      // Persist the last used preference so user choice is remembered
      if (useQuickAdd !== settings.useQuickAddEndpoint) {
        await plugin.writeOptions({ useQuickAddEndpoint: useQuickAdd });
      }
      await plugin.services.todoist.actions.createTask(
        buildWithLink(content, options.appendLinkTo === "content"),
        params,
      );
      new Notice(i18n.successNotice);
    } catch (err) {
      new Notice(i18n.errorNotice);
      console.error("Failed to create task", err);
    }
  };

  const linkDestinationMessage = getLinkDestinationMessage(options.appendLinkTo, i18n);

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
        <div className="task-creation-selectors-group">
          <DueDateSelector selected={dueDate} setSelected={setDueDate} />
          <PrioritySelector selected={priority} setSelected={setPriority} />
          <LabelSelector selected={labels} setSelected={setLabels} />
        </div>
        <div className="task-creation-selectors-group">
          <OptionsSelector selected={options} setSelected={setOptions} />
        </div>
      </div>
      <div className="task-creation-notes">
        <ul>{linkDestinationMessage && <li>{linkDestinationMessage}</li>}</ul>
      </div>
      <div className="task-creation-quick-add-toggle">
        <label className="quick-add-toggle-label">
          <input
            type="checkbox"
            checked={useQuickAdd}
            onChange={(e) => setUseQuickAdd(e.currentTarget.checked)}
          />
          <span>Use natural language (quick add)</span>
        </label>
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

const getInboxProject = (plugin: TodoistPlugin): ProjectIdentifier => {
  const { todoist } = plugin.services;
  const projects = Array.from(todoist.data().projects.iter());

  for (const project of projects) {
    if (project.inboxProject) {
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
