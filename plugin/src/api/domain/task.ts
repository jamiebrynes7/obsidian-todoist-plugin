import type { DueDate } from "@/api/domain/dueDate";
import type { ProjectId } from "@/api/domain/project";
import type { SectionId } from "@/api/domain/section";

export type TaskId = string;

export type Deadline = {
  date: string;
};

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
  duration: Duration | null;
  deadline: Deadline | null;

  order: number;
};

export const Priorities = {
  P4: 1,
  P3: 2,
  P2: 3,
  P1: 4,
} as const;

export type Priority = (typeof Priorities)[keyof typeof Priorities];

export type CreateTaskParams = {
  priority: Priority;
  projectId: ProjectId;
  description?: string;
  sectionId?: SectionId;
  dueDate?: string;
  dueDatetime?: string;
  labels?: string[];
  deadlineDate?: string;
};

export type Duration = {
  amount: number;
  unit: "minute" | "day";
};
