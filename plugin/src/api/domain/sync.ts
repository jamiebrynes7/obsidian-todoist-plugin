import { z } from "zod";

import { labelSchema } from "@/api/domain/label";
import { projectSchema } from "@/api/domain/project";
import { sectionSchema } from "@/api/domain/section";

export const syncTokenSchema = z.string();
export type SyncToken = z.infer<typeof syncTokenSchema>;

export const syncResponseSchema = z.object({
  syncToken: syncTokenSchema,
  labels: z.array(labelSchema),
  projects: z.array(projectSchema),
  sections: z.array(sectionSchema),
});

export type SyncResponse = z.infer<typeof syncResponseSchema>;
