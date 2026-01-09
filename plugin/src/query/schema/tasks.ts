import { z } from "zod/v4";

import { t } from "@/i18n";
import { groupingSchema } from "@/query/schema/grouping";
import type { QueryDefinition } from "@/query/schema/query";
import { showSchema } from "@/query/schema/show";
import { sortingSchema } from "@/query/schema/sorting";
import { viewSchema } from "@/query/schema/view";

const taskQuerySchema = z.object({
  name: z.string().optional(),
  filter: z.string(),
  autorefresh: z.number().nonnegative().optional(),
  sorting: sortingSchema.optional(),
  show: showSchema.optional(),
  groupBy: groupingSchema.optional(),
  view: viewSchema.optional(),
});

export type TaskQuery = z.infer<typeof taskQuerySchema>;

const generateWarnings = (query: TaskQuery): string[] => {
  const warnings: string[] = [];
  if (query.show === undefined) {
    return warnings;
  }

  const show = query.show;

  if (show.has("due") && show.has("time")) {
    warnings.push(t().query.warning.dueAndTime);
  }

  if (show.has("project") && show.has("section")) {
    warnings.push(t().query.warning.projectAndSection);
  }

  return warnings;
};

export const taskQueryDefinition: QueryDefinition<typeof taskQuerySchema> = {
  schema: taskQuerySchema,
  generateWarnings,
};
