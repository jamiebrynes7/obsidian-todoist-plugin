import { z } from "zod/v4";

import { aliasedSchema } from "@/query/schema/utils";

const showKeysSchema = z.union([
  z.literal("due"),
  z.literal("description"),
  z.literal("labels"),
  z.literal("project"),
  z.literal("deadline"),
  z.literal("time"),
  z.literal("section"),
]);

export type ShowMetadataKey = z.infer<typeof showKeysSchema>;

const showAliases: Record<string, ShowMetadataKey> = {
  due: "due",
  date: "due",
  description: "description",
  labels: "labels",
  project: "project",
  deadline: "deadline",
  time: "time",
  section: "section",
};

export const showSchema = z.union([
  z.array(aliasedSchema(showKeysSchema, showAliases)).transform((arr) => new Set(arr)),
  z.literal("none").transform(() => new Set([] as ShowMetadataKey[])),
]);
