import { z } from "zod";

import { dueDateSchema } from "@/api/domain/dueDate";
import { projectIdSchema } from "@/api/domain/project";
import { sectionIdSchema } from "@/api/domain/section";

export const taskIdSchema = z.string();
export type TaskId = z.infer<typeof taskIdSchema>;

export const deadlineSchema = z.object({
  date: z.string(),
});
export type Deadline = z.infer<typeof deadlineSchema>;

export const durationSchema = z.object({
  amount: z.number(),
  unit: z.enum(["minute", "day"]),
});
export type Duration = z.infer<typeof durationSchema>;

// Keep the Priorities const for application use
export const Priorities = {
  P4: 1,
  P3: 2,
  P2: 3,
  P1: 4,
} as const;

export const prioritySchema = z.union([
  z.literal(Priorities.P1),
  z.literal(Priorities.P2),
  z.literal(Priorities.P3),
  z.literal(Priorities.P4),
]);

export type Priority = z.infer<typeof prioritySchema>;

export const taskSchema = z.object({
  id: taskIdSchema,
  createdAt: z.string(),
  content: z.string(),
  description: z.string(),
  projectId: projectIdSchema,
  sectionId: sectionIdSchema.nullable(),
  parentId: taskIdSchema.nullable(),
  labels: z.array(z.string()),
  priority: prioritySchema,
  due: dueDateSchema.nullable(),
  duration: durationSchema.nullable(),
  deadline: deadlineSchema.nullable(),
  order: z.number(),
});
export type Task = z.infer<typeof taskSchema>;

export const createTaskParamsSchema = z.object({
  priority: prioritySchema,
  projectId: projectIdSchema,
  description: z.string().optional(),
  sectionId: sectionIdSchema.optional(),
  dueDate: z.string().optional(),
  dueDatetime: z.string().optional(),
  labels: z.array(z.string()).optional(),
  deadlineDate: z.string().optional(),
});
export type CreateTaskParams = z.infer<typeof createTaskParamsSchema>;
