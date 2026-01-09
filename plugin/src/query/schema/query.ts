import type { z } from "zod/v4";

export type QueryDefinition<T extends z.ZodObject> = {
  schema: T;
  generateWarnings: (data: z.infer<T>) => string[];
};
