import { z } from "zod/v4";

import { aliasedSchema } from "@/query/schema/utils";

const sortingKeysSchema = z.union([
  z.literal("priority"),
  z.literal("priorityAscending"),
  z.literal("dateAscending"),
  z.literal("dateDescending"),
  z.literal("order"),
  z.literal("dateAddedAscending"),
  z.literal("dateAddedDescending"),
  z.literal("alphabeticalAscending"),
  z.literal("alphabeticalDescending"),
]);

export type SortingKey = z.infer<typeof sortingKeysSchema>;

export const sortingAliases: Record<string, z.infer<typeof sortingKeysSchema>> = {
  priority: "priority",
  priorityAscending: "priorityAscending",
  priorityDescending: "priority",
  date: "dateAscending",
  dateAscending: "dateAscending",
  dateDescending: "dateDescending",
  order: "order",
  dateAdded: "dateAddedAscending",
  dateAddedAscending: "dateAddedAscending",
  dateAddedDescending: "dateAddedDescending",
  alphabetical: "alphabeticalAscending",
  alphabeticalAscending: "alphabeticalAscending",
  alphabeticalDescending: "alphabeticalDescending",
};

export const sortingSchema = z.array(aliasedSchema(sortingKeysSchema, sortingAliases));
