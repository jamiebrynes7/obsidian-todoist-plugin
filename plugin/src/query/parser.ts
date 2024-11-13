import { GroupVariant, type Query, ShowMetadataVariant, SortingVariant } from "@/query/query";
import YAML from "yaml";

const possibleWarnings: Record<string, string> = {
  JsonQuery:
    "This query is written using JSON. This is deprecated and will be removed in a future version. Please use YAML instead.",
  GroupParameter:
    "The 'group' field is deprecated and will be removed in a future version. Please use 'groupBy' instead.",
};

export class ParsingError extends Error {
  inner: unknown | undefined;

  constructor(msg: string, inner: unknown | undefined = undefined) {
    super(msg);
    this.inner = inner;
  }

  public toString(): string {
    if (this.inner) {
      return `${this.message}: '${this.inner}'`;
    }

    return super.toString();
  }
}

export type QueryWarning = string;

export function parseQuery(raw: string): [Query, QueryWarning[]] {
  let obj: Record<string, unknown>;
  const warnings: QueryWarning[] = [];

  try {
    obj = tryParseAsJson(raw);
    warnings.push(possibleWarnings.JsonQuery);
  } catch (e) {
    try {
      obj = tryParseAsYaml(raw);
    } catch (e) {
      throw new ParsingError("Unable to parse as YAML or JSON");
    }
  }

  const [query, parsingWarnings] = parseObject(obj);
  warnings.push(...parsingWarnings);

  return [query, warnings];
}

function tryParseAsJson(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new ParsingError("Invalid JSON", e);
  }
}

function tryParseAsYaml(raw: string): Record<string, unknown> {
  try {
    return YAML.parse(raw);
  } catch (e) {
    throw new ParsingError("Invalid YAML", e);
  }
}

function parseObject(query: Record<string, unknown>): [Query, QueryWarning[]] {
  // Keep old queries working for a period of time.
  const hasOldGroup = booleanField(query, "group") ?? false;
  const groupBy = hasOldGroup
    ? GroupVariant.Project
    : (optionField(query, "groupBy", groupByVariantLookup) ?? GroupVariant.None);

  const warnings: QueryWarning[] = [];
  if (hasOldGroup) {
    warnings.push(possibleWarnings.GroupParameter);
  }

  return [
    {
      name: stringField(query, "name") ?? "",
      filter: asRequired("filter", stringField(query, "filter")),
      autorefresh: numberField(query, "autorefresh", { isPositive: true }) ?? 0,
      sorting: optionsArrayField(query, "sorting", sortingLookup) ?? [SortingVariant.Order],
      show: new Set(
        optionsArrayField(query, "show", showMetadataVariantLookup) ??
          Object.values(showMetadataVariantLookup),
      ),
      groupBy,
    },
    warnings,
  ];
}

function asRequired<T>(key: string, val: T | undefined): T {
  if (val === undefined) {
    throw new ParsingError(`Field ${key} must be text`);
  }

  return val as T;
}

function stringField(obj: Record<string, unknown>, key: string): string | undefined {
  const value = obj[key];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ParsingError(`Field ${key} must be text`);
  }

  return value as string;
}

function numberField(
  obj: Record<string, unknown>,
  key: string,
  options?: { isPositive: boolean },
): number | undefined {
  const value = obj[key];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "number") {
    throw new ParsingError(`Field ${key} must be a number`);
  }

  const num = value as number;

  if (Number.isNaN(num)) {
    throw new ParsingError(`Field ${key} must be a number`);
  }

  if ((options?.isPositive ?? false) && num < 0) {
    throw new ParsingError(`Field ${key} must be a positive number`);
  }

  return num;
}

function booleanField(obj: Record<string, unknown>, key: string): boolean | undefined {
  const value = obj[key];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "boolean") {
    throw new ParsingError(`Field ${key} must be a boolean.`);
  }

  return value as boolean;
}

function optionsArrayField<T>(
  obj: Record<string, unknown>,
  key: string,
  lookup: Record<string, T>,
): T[] | undefined {
  const value = obj[key];

  if (value === undefined) {
    return undefined;
  }

  const opts = Object.keys(lookup).join(", ");
  if (!Array.isArray(value)) {
    throw new ParsingError(`Field ${key} must be an array from values: ${opts}`);
  }

  const elems = value as Record<string, unknown>[];
  const parsedElems = [];

  for (const ele of elems) {
    if (typeof ele !== "string") {
      throw new ParsingError(`Field ${key} must be an array from values: ${opts}`);
    }

    const lookupValue = lookup[ele];
    if (lookupValue === undefined) {
      throw new ParsingError(`Field ${key} must be an array from values: ${opts}`);
    }

    parsedElems.push(lookupValue);
  }

  return parsedElems;
}

function optionField<T>(
  obj: Record<string, unknown>,
  key: string,
  lookup: Record<string, T>,
): T | undefined {
  const value = obj[key];

  if (value === undefined) {
    return undefined;
  }

  const opts = Object.keys(lookup).join(", ");
  if (typeof value !== "string") {
    throw new ParsingError(`Field ${key} must be one of: ${opts}`);
  }

  const lookupValue = lookup[value];
  if (lookupValue === undefined) {
    throw new ParsingError(`Field ${key} must be one of: ${opts}`);
  }

  return lookupValue;
}

const sortingLookup: Record<string, SortingVariant> = {
  priority: SortingVariant.Priority,
  priorityAscending: SortingVariant.PriorityAscending,
  priorityDescending: SortingVariant.Priority,
  date: SortingVariant.Date,
  dateAscending: SortingVariant.Date,
  dateDescending: SortingVariant.DateDescending,
  order: SortingVariant.Order,
  dateAdded: SortingVariant.DateAdded,
  dateAddedAscending: SortingVariant.DateAdded,
  dateAddedDescending: SortingVariant.DateAddedDescending,
};

const showMetadataVariantLookup: Record<string, ShowMetadataVariant> = {
  due: ShowMetadataVariant.Due,
  date: ShowMetadataVariant.Due,
  description: ShowMetadataVariant.Description,
  labels: ShowMetadataVariant.Labels,
  project: ShowMetadataVariant.Project,
};

const groupByVariantLookup: Record<string, GroupVariant> = {
  project: GroupVariant.Project,
  section: GroupVariant.Section,
  priority: GroupVariant.Priority,
  due: GroupVariant.Date,
  date: GroupVariant.Date,
  labels: GroupVariant.Label,
};
