import { SortingVariant, type Query, ShowMetadataVariant } from "./query";
import YAML from "yaml";

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

export function parseQuery(raw: string): Query {
  let obj: any;

  try {
    obj = tryParseAsJson(raw);
  } catch (e) {
    try {
      obj = tryParseAsYaml(raw);
    } catch (e) {
      throw new ParsingError("Unable to parse as YAML or JSON");
    }
  }

  return parseObject(obj);
}

function tryParseAsJson(raw: string): any {
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new ParsingError("Invalid JSON", e);
  }
}

function tryParseAsYaml(raw: string): any {
  try {
    return YAML.parse(raw);
  } catch (e) {
    throw new ParsingError("Invalid YAML", e);
  }
}

function parseObject(query: any): Query {
  return {
    name: stringField(query, "name") ?? "",
    filter: asRequired("filter", stringField(query, "filter")),
    group: booleanField(query, "group") ?? false,
    autorefresh: numberField(query, "autorefresh", { isPositive: true }) ?? 0,
    sorting: optionsArrayField(query, "sorting", sortingLookup) ?? [SortingVariant.Order],
    show: new Set(optionsArrayField(query, "show", showMetadataVariantLookup) ?? Object.values(showMetadataVariantLookup)),
  };
}

function asRequired<T>(key: string, val: T | undefined): T {
  if (val === undefined) {
    throw new ParsingError(`Field ${key} must be text`);
  }

  return val as T;
}

function stringField(obj: any, key: string): string | undefined {
  const value = obj[key];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ParsingError(`Field ${key} must be text`);
  }

  return value as string;
}

function numberField(obj: any, key: string, options?: { isPositive: boolean }): number | undefined {
  const value = obj[key];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "number") {
    throw new ParsingError(`Field ${key} must be a number`);
  }

  const num = value as number;

  if (isNaN(num)) {
    throw new ParsingError(`Field ${key} must be a number`);
  }

  if ((options?.isPositive ?? false) && num < 0) {
    throw new ParsingError(`Field ${key} must be a positive number`);
  }

  return num;
}

function booleanField(obj: any, key: string): boolean | undefined {
  const value = obj[key];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "boolean") {
    throw new ParsingError(`Field ${key} must be a boolean.`);
  }

  return value as boolean;
}

function optionsArrayField<T>(obj: any, key: string, lookup: Record<string, T>): T[] | undefined {
  const value = obj[key];

  if (value === undefined) {
    return undefined;
  }

  const opts = Object.keys(lookup).join(", ");
  if (!Array.isArray(value)) {
    throw new ParsingError(`Field ${key} must be an array from values: ${opts}`);
  }

  const elems = value as any[];
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

const sortingLookup: Record<string, SortingVariant> = {
  "priority": SortingVariant.Priority,
  "priorityAscending": SortingVariant.Priority,
  "priorityDescending": SortingVariant.PriorityDescending,
  "date": SortingVariant.Date,
  "dateAscending": SortingVariant.Date,
  "dateDescending": SortingVariant.DateDescending,
  "order": SortingVariant.Order,
  "dateAdded": SortingVariant.DateAdded,
  "dateAddedAscending": SortingVariant.DateAdded,
  "dateAddedDescending": SortingVariant.DateAddedDescending,
}

const showMetadataVariantLookup: Record<string, ShowMetadataVariant> = {
  "due": ShowMetadataVariant.Due,
  "date": ShowMetadataVariant.Due,
  "description": ShowMetadataVariant.Description,
  "labels": ShowMetadataVariant.Labels,
  "project": ShowMetadataVariant.Project,
};