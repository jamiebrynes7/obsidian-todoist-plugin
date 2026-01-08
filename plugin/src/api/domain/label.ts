import { z } from "zod";

export const labelIdSchema = z.string();
export type LabelId = z.infer<typeof labelIdSchema>;

export const labelSchema = z.object({
  id: labelIdSchema,
  name: z.string(),
  color: z.string(),
  isDeleted: z.boolean(),
});

export type Label = z.infer<typeof labelSchema>;
