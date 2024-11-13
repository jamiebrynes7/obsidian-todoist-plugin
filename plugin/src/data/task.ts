import type { DueDate } from "@/api/domain/dueDate";
import type { Label } from "@/api/domain/label";
import type { Project } from "@/api/domain/project";
import type { Section } from "@/api/domain/section";
import type { Priority, TaskId } from "@/api/domain/task";

export type Task = {
  id: TaskId;
  createdAt: string;

  content: string;
  description: string;

  project: Project;
  section?: Section;
  parentId?: TaskId;

  labels: Label[];
  priority: Priority;

  due?: DueDate;
  order: number;
};
