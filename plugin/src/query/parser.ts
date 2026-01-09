import { load as loadYaml } from "js-yaml";
import { z } from "zod";

import { t } from "@/i18n";
import type { QueryDefinition } from "@/query/schema/query";

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

export function parseQuery<T extends z.ZodObject>(
  raw: string,
  definition: QueryDefinition<T>,
): [z.infer<T>, QueryWarning[]] {
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

  const [query, parsingWarnings] = parseObjectZod(obj, definition);
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

function parseObjectZod<T extends z.ZodObject>(
  query: Record<string, unknown>,
  definition: QueryDefinition<T>,
): [z.infer<T>, QueryWarning[]] {
  const warnings: QueryWarning[] = [];
  for (const key of findUnknownKeys(query, definition.schema)) {
    warnings.push(t().query.warning.unknownKey(key));
  }

  const out = definition.schema.safeParse(query);
  if (!out.success) {
    throw new ParsingError(formatZodError(out.error));
  }

  warnings.push(...definition.generateWarnings(out.data));
  return [out.data, warnings];
}

function formatZodError<T extends z.ZodObject>(error: z.ZodError<z.infer<T>>): ErrorTree[] {
  const tree = z.treeifyError(error);

  const errors: ErrorTree[] = [...tree.errors];
  if (tree.properties === undefined) {
    return errors;
  }

  for (const [key, child] of Object.entries(tree.properties)) {
    if (child === undefined) {
      continue;
    }

    if (child.errors.length > 0) {
      errors.push({
        msg: `Field '${key}' has the following issues:`,
        children: child.errors,
      });
    }

    if (
      "items" in child &&
      child.items !== undefined &&
      child.items !== null &&
      Array.isArray(child.items)
    ) {
      const items = child.items as Array<{ errors: string[] }>;

      const root: ErrorTree = {
        msg: `Field '${key}' elements have the following issues:`,
        children: items.flatMap((item, idx) =>
          item.errors.map((msg) => `Item '${key}[${idx}]': ${msg}`),
        ),
      };
      errors.push(root);
    }
  }

  return errors;
}
