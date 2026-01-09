import { z } from "zod/v4";

import { aliasedSchema } from "@/query/schema/utils";

const groupingKeysSchema = z.union([
  z.literal("project"),
  z.literal("section"),
  z.literal("priority"),
  z.literal("due"),
  z.literal("label"),
]);

export type GroupingKey = z.infer<typeof groupingKeysSchema>;

const groupingAliases: Record<string, GroupingKey> = {
  project: "project",
  section: "section",
  priority: "priority",
  due: "due",
  date: "due",
  labels: "label",
};

export const groupingSchema = aliasedSchema(groupingKeysSchema, groupingAliases);
