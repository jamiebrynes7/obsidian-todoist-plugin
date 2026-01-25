import { toCalendarDateTime, toZoned } from "@internationalized/date";
import { Notice, type TFile } from "obsidian";
import type React from "react";
import { useEffect, useState } from "react";
import { Button, Label, Menu, MenuItem, MenuTrigger } from "react-aria-components";

import { t } from "@/i18n";
import { timezone, today } from "@/infra/time";
import {
  type AddTaskAction,
  type DueDateDefaultSetting,
  type LabelsDefaultSetting,
  type ProjectDefaultSetting,
  useSettingsStore,
} from "@/settings";
import { ModalContext, PluginContext } from "@/ui/context";

import type TodoistPlugin from "../..";
import type { Label as TodoistLabel } from "../../api/domain/label";
import type { CreateTaskParams, Priority } from "../../api/domain/task";
import { ObsidianIcon } from "../components/obsidian-icon";
import { type Deadline, DeadlineSelector } from "./DeadlineSelector";
import { type DueDate, DueDateSelector } from "./DueDateSelector";
import { LabelSelector } from "./LabelSelector";
import { Popover } from "./Popover";
import { PrioritySelector } from "./PrioritySelector";
import { type ProjectIdentifier, ProjectSelector } from "./ProjectSelector";
import { TaskContentInput } from "./TaskContentInput";
import { buildClipboardMarkdown, buildTaskContent, type FileInfo } from "./taskContent";
import "./styles.scss";

import type { Translations } from "@/i18n/translation";
import { OptionsSelector } from "@/ui/createTaskModal/OptionsSelector";

const toFileInfo = (file: TFile | undefined): FileInfo | undefined => {
  if (file === undefined) {
    return undefined;
  }

  return {
    name: file.name,
    path: file.path,
    vaultName: file.vault.getName(),
  };
};

const readyCheckIntervalMs = 500;

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
    default: {
      const _: never = setting;
      throw new Error("Unknown due date default setting");
    }
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

const calculateDefaultLabels = (
  plugin: TodoistPlugin,
  labelsSetting: LabelsDefaultSetting,
): TodoistLabel[] => {
  if (labelsSetting.length === 0) {
    return [];
  }

  const allLabels = Array.from(plugin.services.todoist.data().labels.iterActive());
  const validLabels: TodoistLabel[] = [];
  const deletedLabelNames: string[] = [];

  for (const defaultLabel of labelsSetting) {
    const label = allLabels.find((l) => l.id === defaultLabel.labelId);
    if (label !== undefined) {
      validLabels.push(label);
    } else {
      deletedLabelNames.push(defaultLabel.labelName);
    }
  }

  if (deletedLabelNames.length > 0) {
    const noticeMsg = t().createTaskModal.defaultLabelsDeletedNotice(deletedLabelNames.join(", "));
    new Notice(noticeMsg);
  }

  return validLabels;
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
    const id = window.setInterval(refreshIsReady, readyCheckIntervalMs);
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
  const [labels, setLabels] = useState<TodoistLabel[]>(() =>
    calculateDefaultLabels(plugin, settings.taskCreationDefaultLabels),
  );
  const [deadline, setDeadline] = useState<Deadline | undefined>();
  const [project, setProject] = useState<ProjectIdentifier>(
    calculateDefaultProject(plugin, settings.taskCreationDefaultProject),
  );

  const [options, setOptions] = useState<TaskCreationOptions>(initialOptions);
  const [currentAction, setCurrentAction] = useState<AddTaskAction>(settings.defaultAddTaskAction);

  const isPremium = plugin.services.todoist.isPremium();
  const isSubmitButtonDisabled = content === "" && options.appendLinkTo !== "content";

  const i18n = t().createTaskModal;

  const createTask = async (action: AddTaskAction) => {
    if (isSubmitButtonDisabled) {
      return;
    }

    const fileInfo = toFileInfo(fileContext);

    modal.close();

    const params: CreateTaskParams = {
      description: buildTaskContent(description, toFileInfo(fileContext), {
        appendLink: options.appendLinkTo === "description",
        wrapInParens: settings.shouldWrapLinksInParens,
      }),
      priority,
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

    if (deadline !== undefined) {
      params.deadlineDate = deadline.date.toString();
    }

    try {
      const taskContent = buildTaskContent(content, toFileInfo(fileContext), {
        appendLink: options.appendLinkTo === "content",
        wrapInParens: settings.shouldWrapLinksInParens,
      });

      const task = await plugin.services.todoist.actions.createTask(taskContent, params);

      if (action === "add-copy-app" || action === "add-copy-web") {
        const taskRef = {
          id: task.id,
          projectId: task.projectId,
        };

        const markdownLink = buildClipboardMarkdown(
          content,
          taskRef,
          {
            appendLink: options.appendLinkTo === "content",
            variant: action,
          },
          fileInfo,
        );
        try {
          await navigator.clipboard.writeText(markdownLink);
          new Notice(i18n.linkCopiedNotice);
        } catch (clipboardErr) {
          new Notice(i18n.linkCopyFailedNotice);
          console.error("Failed to copy to clipboard", clipboardErr);
        }
      } else {
        new Notice(i18n.successNotice);
      }
    } catch (err) {
      new Notice(i18n.errorNotice);
      console.error("Failed to create task", err);
    }
  };

  const getActionLabel = (action: AddTaskAction): string => {
    switch (action) {
      case "add":
        return i18n.addTaskButtonLabel;
      case "add-copy-app":
        return i18n.addTaskAndCopyAppLabel;
      case "add-copy-web":
        return i18n.addTaskAndCopyWebLabel;
      default: {
        const _: never = action;
        throw new Error("Unknown add task action");
      }
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
        onEnterKey={() => createTask(currentAction)}
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
          {isPremium && <DeadlineSelector selected={deadline} setSelected={setDeadline} />}
        </div>
        <div className="task-creation-selectors-group">
          <OptionsSelector selected={options} setSelected={setOptions} />
        </div>
      </div>
      <div className="task-creation-notes">
        <ul>{linkDestinationMessage && <li>{linkDestinationMessage}</li>}</ul>
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
          <div className="add-task-button-group">
            <Button
              className="mod-cta add-task-primary"
              isDisabled={isSubmitButtonDisabled}
              onPress={() => createTask(currentAction)}
              aria-label={getActionLabel(currentAction)}
            >
              {getActionLabel(currentAction)}
            </Button>
            <MenuTrigger>
              <Button
                className="mod-cta add-task-dropdown"
                isDisabled={isSubmitButtonDisabled}
                aria-label={i18n.actionMenuLabel}
              >
                <ObsidianIcon id="chevron-down" size="s" />
              </Button>
              <Popover>
                <Menu
                  className="add-task-action-menu task-option-dialog"
                  aria-label={i18n.actionMenuLabel}
                  onAction={(key) => setCurrentAction(key as AddTaskAction)}
                >
                  <MenuItem key="add" id="add">
                    <Label>{i18n.addTaskButtonLabel}</Label>
                  </MenuItem>
                  <MenuItem key="add-copy-app" id="add-copy-app">
                    <Label>{i18n.addTaskAndCopyAppLabel}</Label>
                  </MenuItem>
                  <MenuItem key="add-copy-web" id="add-copy-web">
                    <Label>{i18n.addTaskAndCopyWebLabel}</Label>
                  </MenuItem>
                </Menu>
              </Popover>
            </MenuTrigger>
          </div>
        </div>
      </div>
    </div>
  );
};

const getInboxProject = (plugin: TodoistPlugin): ProjectIdentifier => {
  const { todoist } = plugin.services;
  const projects = Array.from(todoist.data().projects.iterActive());

  for (const project of projects) {
    if (project.inboxProject) {
      return {
        projectId: project.id,
      };
    }
  }

  const i18n = t().createTaskModal;

  new Notice(i18n.failedToFindInboxNotice);
  throw new Error("Could not find inbox project");
};
