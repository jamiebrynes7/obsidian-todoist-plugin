import { describe, expect, it } from "vitest";
import { z } from "zod";

import { parseApiResponse, TodoistValidationError } from "./validation";

describe("parseApiResponse", () => {
  const testSchema = z.object({
    name: z.string(),
    age: z.number(),
  });

  it("parses valid JSON and returns camelized data", () => {
    const jsonBody = JSON.stringify({ name: "John", age: 30 });
    const result = parseApiResponse(testSchema, jsonBody);
    expect(result).toEqual({ name: "John", age: 30 });
  });

  it("converts snake_case to camelCase", () => {
    const schema = z.object({
      firstName: z.string(),
      lastName: z.string(),
      userId: z.number(),
    });

    const jsonBody = JSON.stringify({
      first_name: "John",
      last_name: "Doe",
      user_id: 123,
    });

    const result = parseApiResponse(schema, jsonBody);
    expect(result).toEqual({
      firstName: "John",
      lastName: "Doe",
      userId: 123,
    });
  });

  it("throws TodoistValidationError for invalid data", () => {
    const jsonBody = JSON.stringify({ name: "John", age: "thirty" });
    expect(() => {
      parseApiResponse(testSchema, jsonBody);
    }).toThrow(TodoistValidationError);
  });

  it("preserves camelized data in error", () => {
    const jsonBody = JSON.stringify({ name: "John", age: "thirty" });
    try {
      parseApiResponse(testSchema, jsonBody);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(TodoistValidationError);
      const validationError = error as TodoistValidationError;
      // Data should be camelized before validation
      expect(validationError.data).toEqual({ name: "John", age: "thirty" });
    }
  });

  it("includes formatted error messages", () => {
    const jsonBody = JSON.stringify({ name: "John", age: "thirty" });
    try {
      parseApiResponse(testSchema, jsonBody);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(TodoistValidationError);
      const validationError = error as TodoistValidationError;
      expect(validationError.message).toContain("Todoist API validation failed");
      expect(validationError.message).toContain("age");
    }
  });

  it("validates nested objects with camelization", () => {
    const nestedSchema = z.object({
      userInfo: z.object({
        firstName: z.string(),
        age: z.number(),
      }),
      timestamp: z.string(),
    });

    const jsonBody = JSON.stringify({
      user_info: {
        first_name: "John",
        age: 30,
      },
      timestamp: "2024-01-01",
    });

    const result = parseApiResponse(nestedSchema, jsonBody);
    expect(result).toEqual({
      userInfo: {
        firstName: "John",
        age: 30,
      },
      timestamp: "2024-01-01",
    });
  });

  it("validates arrays", () => {
    const arraySchema = z.object({
      items: z.array(z.string()),
    });

    const jsonBody = JSON.stringify({ items: ["a", "b", "c"] });
    const result = parseApiResponse(arraySchema, jsonBody);
    expect(result).toEqual({ items: ["a", "b", "c"] });
  });

  it("throws error for invalid array elements", () => {
    const arraySchema = z.object({
      items: z.array(z.string()),
    });

    const jsonBody = JSON.stringify({ items: ["a", 123, "c"] });
    expect(() => {
      parseApiResponse(arraySchema, jsonBody);
    }).toThrow(TodoistValidationError);
  });

  it("validates nullable fields", () => {
    const nullableSchema = z.object({
      name: z.string(),
      optionalValue: z.string().nullable(),
    });

    const jsonBodyWithNull = JSON.stringify({
      name: "John",
      optional_value: null,
    });
    const result = parseApiResponse(nullableSchema, jsonBodyWithNull);
    expect(result).toEqual({ name: "John", optionalValue: null });

    const jsonBodyWithValue = JSON.stringify({
      name: "John",
      optional_value: "value",
    });
    const result2 = parseApiResponse(nullableSchema, jsonBodyWithValue);
    expect(result2).toEqual({ name: "John", optionalValue: "value" });
  });
});

describe("TodoistValidationError", () => {
  it("contains zodError and original data", () => {
    const schema = z.object({ id: z.number() });
    const jsonBody = JSON.stringify({ id: "not-a-number" });

    try {
      parseApiResponse(schema, jsonBody);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(TodoistValidationError);
      const validationError = error as TodoistValidationError;
      expect(validationError.zodError).toBeDefined();
      expect(validationError.data).toEqual({ id: "not-a-number" });
      expect(validationError.name).toBe("TodoistValidationError");
    }
  });
});
