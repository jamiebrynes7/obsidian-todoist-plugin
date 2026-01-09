import { z } from "zod/v4";

export const viewSchema = z.object({
  noTasksMessage: z.string().optional(),
});
