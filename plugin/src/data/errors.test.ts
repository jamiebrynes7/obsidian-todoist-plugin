import { describe, expect, it } from "vitest";

import { TodoistApiError } from "@/api";
import type { RequestParams, WebResponse } from "@/api/fetcher";
import { mapApiError, QueryErrorKind } from "@/data/errors";

const makeRequest = (): RequestParams => ({
  url: "https://api.todoist.com/api/v1/tasks",
  method: "GET",
  headers: {},
});

const makeResponse = (statusCode: number): WebResponse => ({
  statusCode,
  body: "error",
});

describe("mapApiError", () => {
  it("should map BadRequest (400) to QueryErrorKind.BadRequest", () => {
    const error = new TodoistApiError(makeRequest(), makeResponse(400));
    expect(mapApiError(error)).toBe(QueryErrorKind.BadRequest);
  });

  it("should map Unauthorized (401) to QueryErrorKind.Unauthorized", () => {
    const error = new TodoistApiError(makeRequest(), makeResponse(401));
    expect(mapApiError(error)).toBe(QueryErrorKind.Unauthorized);
  });

  it("should map Forbidden (403) to QueryErrorKind.Forbidden", () => {
    const error = new TodoistApiError(makeRequest(), makeResponse(403));
    expect(mapApiError(error)).toBe(QueryErrorKind.Forbidden);
  });

  it("should map ServerError (500) to QueryErrorKind.ServerError", () => {
    const error = new TodoistApiError(makeRequest(), makeResponse(500));
    expect(mapApiError(error)).toBe(QueryErrorKind.ServerError);
  });

  it("should map other 5xx errors (502) to QueryErrorKind.ServerError", () => {
    const error = new TodoistApiError(makeRequest(), makeResponse(502));
    expect(mapApiError(error)).toBe(QueryErrorKind.ServerError);
  });

  it("should map non-TodoistApiError to QueryErrorKind.Unknown", () => {
    expect(mapApiError(new Error("network failure"))).toBe(QueryErrorKind.Unknown);
  });
});
