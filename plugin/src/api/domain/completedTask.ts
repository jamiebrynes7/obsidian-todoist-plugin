import type { DueDate } from "@/api/domain/dueDate";
import type { Priority } from "@/api/domain/task";
import type { Label } from "./label";

export type CompletedTask = {
  id: string;
  task_id: string;
  project_id: string;
  section_id: string | null;
  content: string;
  completed_at: string;
  note_count: number;
  meta_data: string | null;
  item_object: {
    due?: DueDate | null;
    description: string;
    priority: Priority;
    labels: Label[];
  };
};

export type CompletedTasksResponse = {
  items: CompletedTask[];
};

export type GetCompletedTasksParams = {
  project_id?: string;
  limit?: number;
  until?: Date;
  since?: Date;
};
