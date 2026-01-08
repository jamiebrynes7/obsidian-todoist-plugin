import { z } from "zod";

import { projectIdSchema } from "@/api/domain/project";

export const sectionIdSchema = z.string();
export type SectionId = z.infer<typeof sectionIdSchema>;

export const sectionSchema = z.object({
  id: sectionIdSchema,
  projectId: projectIdSchema,
  name: z.string(),
  sectionOrder: z.number(),
  isDeleted: z.boolean(),
  isArchived: z.boolean(),
});

export type Section = z.infer<typeof sectionSchema>;
