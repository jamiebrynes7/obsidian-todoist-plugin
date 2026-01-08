import { z } from "zod";

export const projectIdSchema = z.string();
export type ProjectId = z.infer<typeof projectIdSchema>;

export const projectSchema = z.object({
  id: projectIdSchema,
  parentId: projectIdSchema.nullable(),
  name: z.string(),
  childOrder: z.number(),
  inboxProject: z.boolean().default(false),
  color: z.string(),
  isDeleted: z.boolean(),
  isArchived: z.boolean(),
});

export type Project = z.infer<typeof projectSchema>;
