import { t } from "@/i18n";
import { GroupVariant, type Query, ShowMetadataVariant, SortingVariant } from "@/query/query";
import YAML from "yaml";
import { z } from "zod";

type ErrorTree = string | { msg: string; children: ErrorTree[] };

export class ParsingError extends Error {
  messages: ErrorTree[];
  inner: unknown | undefined;

  constructor(msgs: ErrorTree[], inner: unknown | undefined = undefined) {
    super(msgs.join("\n"));
    this.inner = inner;
    this.messages = msgs;
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
  let obj: Record<string, unknown> | null = null;
  const warnings: QueryWarning[] = [];

  try {
    obj = tryParseAsJson(raw);
    warnings.push(t().query.warning.jsonQuery);
  } catch (e) {
    try {
      obj = tryParseAsYaml(raw);
    } catch (e) {
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
    return YAML.parse(raw);
  } catch (e) {
    throw new ParsingError(["Invalid YAML"], e);
  }
}

const lookupToEnum = <T>(lookup: Record<string, T>) => {
  const keys = Object.keys(lookup);
  //@ts-ignore: There is at least one element for these.
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
});

const showSchema = lookupToEnum({
  due: ShowMetadataVariant.Due,
  date: ShowMetadataVariant.Due,
  description: ShowMetadataVariant.Description,
  labels: ShowMetadataVariant.Labels,
  project: ShowMetadataVariant.Project,
});

const groupBySchema = lookupToEnum({
  project: GroupVariant.Project,
  section: GroupVariant.Section,
  priority: GroupVariant.Priority,
  due: GroupVariant.Date,
  date: GroupVariant.Date,
  labels: GroupVariant.Label,
});

const defaults = {
  name: "",
  autorefresh: 0,
  sorting: [SortingVariant.Order],
  show: [
    ShowMetadataVariant.Due,
    ShowMetadataVariant.Description,
    ShowMetadataVariant.Labels,
    ShowMetadataVariant.Project,
  ],
  groupBy: GroupVariant.None,
};

const querySchema = z.object({
  name: z.string().optional().default(""),
  filter: z.string(),
  autorefresh: z.number().nonnegative().optional().default(0),
  sorting: z
    .array(sortingSchema)
    .optional()
    .transform((val) => val ?? defaults.sorting),
  show: z
    .union([z.array(showSchema), z.literal("none").transform(() => [])])
    .optional()
    .transform((val) => val ?? defaults.show),
  groupBy: groupBySchema.optional().transform((val) => val ?? defaults.groupBy),
});

const validQueryKeys: string[] = querySchema.keyof().options;

function parseObjectZod(query: Record<string, unknown>): [Query, QueryWarning[]] {
  const warnings: QueryWarning[] = [];

  for (const key of Object.keys(query)) {
    if (!validQueryKeys.includes(key)) {
      warnings.push(t().query.warning.unknownKey(key));
    }
  }

  const out = querySchema.safeParse(query);

  if (!out.success) {
    throw new ParsingError(formatZodError(out.error));
  }

  return [
    {
      name: out.data.name,
      filter: out.data.filter,
      autorefresh: out.data.autorefresh,
      sorting: out.data.sorting,
      show: new Set(out.data.show),
      groupBy: out.data.groupBy,
    },
    warnings,
  ];
}

function formatZodError(error: z.ZodError): ErrorTree[] {
  return error.errors.map((err) => {
    const field = formatPath(err.path);
    switch (err.code) {
      case "invalid_type":
        return `Field '${field}' is ${err.received === "undefined" ? "required" : `must be a ${err.expected}`}`;
      case "invalid_enum_value":
        return `Field '${field}' has invalid value '${err.received}'. Valid options are: ${err.options?.join(", ")}`;
      case "invalid_union":
        return {
          msg: "One of the following rules must be met:",
          children: err.unionErrors.flatMap(formatZodError),
        };
      case "invalid_literal":
        return `Field '${field}' has invalid value '${err.received}', must be exactly '${err.expected}'`;
      default:
        return `Field '${field}': ${err.message}`;
    }
  });
}

function formatPath(path: (string | number)[]): string {
  return path.map((p) => (typeof p === "number" ? `[${p}]` : p)).join(".");
}
