import { ModalContext, PluginContext } from "@/ui/context";
import { getLocalTimeZone, toCalendarDateTime, toZoned } from "@internationalized/date";
import { Notice } from "obsidian";
import React, { useEffect, useState } from "react";
import { Button } from "react-aria-components";
import type TodoistPlugin from "../..";
import type { Label } from "../../api/domain/label";
import type { CreateTaskParams, Priority} from "../../api/domain/task";
import type { Task } from "../../data/task";
import { type DueDate, DueDateSelector } from "../components/modal-fields/DueDateSelector";
import * as LabelSelector from "../components/modal-fields/LabelSelector";
import { PrioritySelector } from "../components/modal-fields/PrioritySelector";
import { type ProjectIdentifier, ProjectSelector } from "../components/modal-fields/ProjectSelector";
import { TaskContentInput } from "../components/modal-fields/TaskContentInput";

import {parseDate, parseAbsolute, toTime} from '@internationalized/date';
import "./styles.scss";


type TaskProps = {
  task: Task;
};

export const EditTaskModal: React.FC<TaskProps> = (props) => {
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

  if (!isReady) {
    return <div className="task-creation-modal-root">Loading Todoist data...</div>;
  }

  return <EditTaskModalContent {...props} />;
};

const EditTaskModalContent: React.FC<TaskProps> = ({
  task,
}) => {
  const plugin = PluginContext.use();
  const modal = ModalContext.use();

  const [content, setContent] = useState(task.content);
  const [description, setDescription] = useState(task.description);

  const [dueDate, setDueDate] = useState<DueDate | undefined>(getInitialDueDateFromTask(task));
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [labels, setLabels] = useState<Label[]>(getInitialLabelsFromTask(task, plugin));
  const [project, setProject] = useState<ProjectIdentifier>(getDefaultProject(plugin));

  const isSubmitButtonDisabled = content === "";

  const editTask = async () => {
    if (isSubmitButtonDisabled) {
      return;
    }

    modal.close();

    const params: CreateTaskParams = {
      description: description,
      priority: priority,
      labels: labels.map((l) => l.name),
      projectId: project.projectId,
      sectionId: project.sectionId,
    };

    if (dueDate !== undefined) {
      if (dueDate.time !== undefined) {
        params.dueDatetime = toZoned(
          toCalendarDateTime(dueDate.date, dueDate.time),
          getLocalTimeZone(),
        ).toAbsoluteString();
      } else {
        params.dueDate = dueDate.date.toString();
      }
    }

    try {
      await plugin.services.todoist.actions.editTask(
        task.id,
        content,
        params,
      );
      new Notice("Task edited successfully");
    } catch (err) {
      new Notice("Failed to edit task");
      console.error("Failed to edit task", err);
    }
  };

  return (
    <div className="task-creation-modal-root">
      <TaskContentInput
        className="task-name"
        placeholder="Task name"
        content={content}
        onChange={setContent}
        autofocus={true}
        onEnterKey={editTask}
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
        <LabelSelector.LabelSelector selected={labels} setSelected={setLabels} />
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
            onPress={editTask}
            aria-label="Edit task"
          >
            Edit Task
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

const getInitialDueDateFromTask = (task: Task) : DueDate | undefined => {
  if ( task.due === undefined ) {
    return undefined;
  }

  return {date: parseDate(task.due.date), 
      time: task.due.datetime === undefined ? undefined : toTime(parseAbsolute(task.due.datetime, getLocalTimeZone()))}
}


const getInitialLabelsFromTask = (task: Task, plugin: TodoistPlugin) : Label[] => {
  const labels = Array.from(plugin.services.todoist.data().labels.iter());
  return labels.filter((label) => task.labels.contains(label.name))
}

