import type moment from "moment";
import type { DueDate } from "../api/domain/dueDate";
import type { Project } from "../api/domain/project";
import type { Section } from "../api/domain/section";
import type { Priority, TaskId } from "../api/domain/task";

export type Task = {
  id: TaskId,
  createdAt: string,

  content: string,
  description: string,

  project?: Project,
  section?: Section,
  parentId?: TaskId,

  labels: string[],
  priority: Priority,

  due?: DueDate,
  order: number,
};
