import camelize from "camelize-ts";
import type { z } from "zod";

export class TodoistValidationError extends Error {
  public readonly zodError: z.ZodError;
  public readonly data: unknown;

  constructor(zodError: z.ZodError, data: unknown) {
    const formatted = formatZodError(zodError);
    const errorDetails = formatted.join("\n");
    super(`Todoist API validation failed:\n${errorDetails}`);
    this.zodError = zodError;
    this.data = data;
    this.name = "TodoistValidationError";
  }
}

function formatZodError(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
    return `${path}${issue.message}`;
  });
}

export function parseApiResponse<T>(schema: z.ZodType<T>, jsonBody: string): T {
  const parsed = JSON.parse(jsonBody);
  const camelized = camelize(parsed);
  const result = schema.safeParse(camelized);
  if (!result.success) {
    throw new TodoistValidationError(result.error, camelized);
  }
  return result.data;
}
