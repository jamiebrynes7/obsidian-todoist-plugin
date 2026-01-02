import { load as loadYaml } from "js-yaml";
import { z } from "zod";

import { t } from "@/i18n";
import { GroupVariant, type Query, ShowMetadataVariant, SortingVariant } from "@/query/query";

type ErrorTree = string | { msg: string; children: ErrorTree[] };

export class ParsingError extends Error {
  messages: ErrorTree[];
  inner: unknown | undefined;

  constructor(msgs: ErrorTree[], inner: unknown | undefined = undefined) {
    super(msgs.map((tree) => ParsingError.formatErrorTree(tree)).join("\n"));
    this.inner = inner;
    this.messages = msgs;
  }

  public toString(): string {
    if (this.inner) {
      return `${this.message}: '${this.inner}'`;
    }

    return super.toString();
  }

  private static formatErrorTree(tree: ErrorTree, indent = ""): string {
    if (typeof tree === "string") {
      return `${indent}${tree}`;
    }
    const lines = [`${indent}${tree.msg}`];
    for (const child of tree.children) {
      lines.push(ParsingError.formatErrorTree(child, `${indent}  `));
    }
    return lines.join("\n");
  }
}

export type QueryWarning = string;

export function parseQuery(raw: string): [Query, QueryWarning[]] {
  let obj: Record<string, unknown> | null = null;
  const warnings: QueryWarning[] = [];

  try {
    obj = tryParseAsJson(raw);
    warnings.push(t().query.warning.jsonQuery);
  } catch {
    try {
      obj = tryParseAsYaml(raw);
    } catch {
      throw new ParsingError(["Unable to parse as YAML or JSON"]);
    }
  }

  if (obj === null) {
    obj = {};
  }

  const [query, parsingWarnings] = parseObjectZod(obj);
  warnings.push(...parsingWarnings);

  return [query, warnings];
}

function tryParseAsJson(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new ParsingError(["Invalid JSON"], e);
  }
}

function tryParseAsYaml(raw: string): Record<string, unknown> {
  try {
    return loadYaml(raw) as Record<string, unknown>;
  } catch (e) {
    throw new ParsingError(["Invalid YAML"], e);
  }
}

const lookupToEnum = <T>(lookup: Record<string, T>) => {
  const keys = Object.keys(lookup);
  return z.enum(keys).transform((key) => lookup[key]);
};

const sortingSchema = lookupToEnum({
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
  alphabetical: SortingVariant.Alphabetical,
  alphabeticalAscending: SortingVariant.Alphabetical,
  alphabeticalDescending: SortingVariant.AlphabeticalDescending,
});

const showSchema = lookupToEnum({
  due: ShowMetadataVariant.Due,
  date: ShowMetadataVariant.Due,
  description: ShowMetadataVariant.Description,
  labels: ShowMetadataVariant.Labels,
  project: ShowMetadataVariant.Project,
  deadline: ShowMetadataVariant.Deadline,
  time: ShowMetadataVariant.Time,
  section: ShowMetadataVariant.Section,
});

const groupBySchema = lookupToEnum({
  project: GroupVariant.Project,
  section: GroupVariant.Section,
  priority: GroupVariant.Priority,
  due: GroupVariant.Date,
  date: GroupVariant.Date,
  labels: GroupVariant.Label,
});

const viewSchema = z.object({
  noTasksMessage: z.string().optional(),
});

const defaultQuery = (): Omit<Query, "filter"> => ({
  name: "",
  autorefresh: 0,
  sorting: [SortingVariant.Order],
  show: new Set([
    ShowMetadataVariant.Due,
    ShowMetadataVariant.Description,
    ShowMetadataVariant.Labels,
    ShowMetadataVariant.Project,
    ShowMetadataVariant.Deadline,
  ]),
  groupBy: GroupVariant.None,
  view: {},
});

const querySchema = z.object({
  name: z.string().optional(),
  filter: z.string(),
  autorefresh: z.number().nonnegative().optional(),
  sorting: z.array(sortingSchema).optional(),
  show: z
    .union([
      z.array(showSchema).transform((arr) => new Set(arr)),
      z.literal("none").transform(() => new Set([])),
    ])
    .optional(),
  groupBy: groupBySchema.optional(),
  view: viewSchema.optional(),
});

function findUnknownKeys(obj: Record<string, unknown>, schema: z.ZodObject): string[] {
  const keys: string[] = [];

  const validKeys = schema.keyof().options;

  for (const key of Object.keys(obj)) {
    if (!validKeys.includes(key)) {
      keys.push(key);
      continue;
    }

    const value = obj[key];
    if (typeof value !== "object" || value === null) {
      continue;
    }

    let childSchema: z.ZodObject | undefined;
    const schemaField = schema.shape[key];

    // If the subobject is directly a ZodObject, use that.
    if (schemaField instanceof z.ZodObject) {
      childSchema = schemaField;
    }

    // If the subobject is optional, unwrap it and use the type.
    if (schemaField instanceof z.ZodOptional) {
      const unwrapped = schemaField.unwrap();
      if (unwrapped instanceof z.ZodObject) {
        childSchema = unwrapped;
      }
    }

    if (childSchema !== undefined) {
      const nestedKeys = findUnknownKeys(value as Record<string, unknown>, childSchema);
      keys.push(...nestedKeys.map((w) => `${key}.${w}`));
    }
  }

  return keys;
}

function parseObjectZod(query: Record<string, unknown>): [Query, QueryWarning[]] {
  const warnings: QueryWarning[] = [];

  for (const key of findUnknownKeys(query, querySchema)) {
    warnings.push(t().query.warning.unknownKey(key));
  }

  const out = querySchema.safeParse(query);

  if (!out.success) {
    throw new ParsingError(formatZodError(out.error));
  }

  const show = new Set(out.data.show);

  if (show.has(ShowMetadataVariant.Due) && show.has(ShowMetadataVariant.Time)) {
    warnings.push(t().query.warning.dueAndTime);
  }

  if (show.has(ShowMetadataVariant.Project) && show.has(ShowMetadataVariant.Section)) {
    warnings.push(t().query.warning.projectAndSection);
  }

  return [
    {
      ...defaultQuery(),
      ...out.data,
    },
    warnings,
  ];
}

type QuerySchema = z.infer<typeof querySchema>;

function formatZodError(error: z.ZodError<QuerySchema>): ErrorTree[] {
  const tree = z.treeifyError(error);

  const errors: ErrorTree[] = [...tree.errors];
  if (tree.properties === undefined) {
    return errors;
  }

  for (const [key, child] of Object.entries(tree.properties)) {
    if (child.errors.length > 0) {
      errors.push({
        msg: `Field '${key}' has the following issues:`,
        children: child.errors,
      });
    }

    if ("items" in child && child.items !== undefined) {
      const root: ErrorTree = {
        msg: `Field '${key}' elements have the following issues:`,
        children: child.items.flatMap((item, idx) =>
          item.errors.map((msg) => `Item '${key}[${idx}]': ${msg}`),
        ),
      };
      errors.push(root);
    }
  }

  return errors;
}
