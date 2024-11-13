import type { DueDate } from "@/api/domain/dueDate";
import type { ProjectId } from "@/api/domain/project";
import type { SectionId } from "@/api/domain/section";

export type TaskId = string;

export type Task = {
  id: TaskId;
  createdAt: string;

  content: string;
  description: string;

  projectId: ProjectId;
  sectionId: SectionId | null;
  parentId: TaskId | null;

  labels: string[];
  priority: Priority;

  due: DueDate | null;

  order: number;
};

export type Priority = 1 | 2 | 3 | 4;

export type CreateTaskParams = {
  priority: number;
  projectId: ProjectId;
  description?: string;
  sectionId?: SectionId;
  dueDate?: string;
  dueDatetime?: string;
  labels?: string[];
};
