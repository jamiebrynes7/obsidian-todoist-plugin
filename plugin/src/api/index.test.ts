import { describe, expect, it, vi } from "vitest";

import type { RequestParams, WebFetcher, WebResponse } from "@/api/fetcher";
import { TodoistApiClient, TodoistApiError } from "@/api/index";

function parseUrl(url: string) {
  const parsed = new URL(url);
  return { pathname: parsed.pathname, params: parsed.searchParams };
}

function makeTask(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "123",
    added_at: "2024-01-01T00:00:00Z",
    content: "Test task",
    description: "",
    project_id: "456",
    section_id: null,
    parent_id: null,
    labels: [],
    priority: 1,
    due: null,
    duration: null,
    deadline: null,
    child_order: 0,
    ...overrides,
  };
}

function makePaginatedResponse(
  tasks: Record<string, unknown>[],
  nextCursor: string | null = null,
): WebResponse {
  return {
    statusCode: 200,
    body: JSON.stringify({
      results: tasks,
      next_cursor: nextCursor,
    }),
  };
}

function makeFetcher(): WebFetcher & {
  fetch: ReturnType<typeof vi.fn<(params: RequestParams) => Promise<WebResponse>>>;
} {
  return { fetch: vi.fn<(params: RequestParams) => Promise<WebResponse>>() };
}

describe("TodoistApiClient", () => {
  describe("getTasks", () => {
    it("calls /tasks endpoint when no filter is provided", async () => {
      const fetcher = makeFetcher();
      fetcher.fetch.mockResolvedValueOnce(makePaginatedResponse([makeTask()]));

      const client = new TodoistApiClient("test-token", fetcher);
      const tasks = await client.getTasks();

      expect(tasks).toHaveLength(1);
      expect(tasks[0].id).toBe("123");

      const call = fetcher.fetch.mock.calls[0][0];
      const { pathname } = parseUrl(call.url);
      expect(pathname).toBe("/api/v1/tasks");
    });

    it("calls /tasks/filter with query param when filter is provided", async () => {
      const fetcher = makeFetcher();
      fetcher.fetch.mockResolvedValueOnce(makePaginatedResponse([makeTask()]));

      const client = new TodoistApiClient("test-token", fetcher);
      await client.getTasks("today");

      const call = fetcher.fetch.mock.calls[0][0];
      const { pathname, params } = parseUrl(call.url);
      expect(pathname).toBe("/api/v1/tasks/filter");
      expect(params.get("query")).toBe("today");
    });

    it("encodes filter with spaces using percent encoding", async () => {
      const fetcher = makeFetcher();
      fetcher.fetch.mockResolvedValueOnce(makePaginatedResponse([makeTask()]));

      const client = new TodoistApiClient("test-token", fetcher);
      await client.getTasks("(today | overdue) & assigned to: me");

      const call = fetcher.fetch.mock.calls[0][0];
      // Verify spaces are encoded as %20, not +
      expect(call.url).toContain("%20");
      expect(call.url).not.toContain("+");
      // Verify the query param value is correct when decoded
      const { params } = parseUrl(call.url);
      expect(params.get("query")).toBe("(today | overdue) & assigned to: me");
    });
  });

  describe("pagination", () => {
    it("returns results from a single page when nextCursor is null", async () => {
      const fetcher = makeFetcher();
      fetcher.fetch.mockResolvedValueOnce(
        makePaginatedResponse([makeTask(), makeTask({ id: "456" })]),
      );

      const client = new TodoistApiClient("test-token", fetcher);
      const tasks = await client.getTasks();

      expect(tasks).toHaveLength(2);
      expect(fetcher.fetch).toHaveBeenCalledTimes(1);
    });

    it("follows pagination cursor across multiple pages", async () => {
      const fetcher = makeFetcher();
      fetcher.fetch
        .mockResolvedValueOnce(makePaginatedResponse([makeTask({ id: "1" })], "cursor-abc"))
        .mockResolvedValueOnce(makePaginatedResponse([makeTask({ id: "2" })]));

      const client = new TodoistApiClient("test-token", fetcher);
      const tasks = await client.getTasks();

      expect(tasks).toHaveLength(2);
      expect(tasks[0].id).toBe("1");
      expect(tasks[1].id).toBe("2");
      expect(fetcher.fetch).toHaveBeenCalledTimes(2);

      const secondCall = fetcher.fetch.mock.calls[1][0];
      const { params } = parseUrl(secondCall.url);
      expect(params.get("cursor")).toBe("cursor-abc");
    });

    it("preserves filter query params across paginated requests", async () => {
      const fetcher = makeFetcher();
      fetcher.fetch
        .mockResolvedValueOnce(makePaginatedResponse([makeTask({ id: "1" })], "cursor-1"))
        .mockResolvedValueOnce(makePaginatedResponse([makeTask({ id: "2" })]));

      const client = new TodoistApiClient("test-token", fetcher);
      await client.getTasks("today");

      const firstCall = fetcher.fetch.mock.calls[0][0];
      const firstParams = parseUrl(firstCall.url).params;
      expect(firstParams.get("query")).toBe("today");

      const secondCall = fetcher.fetch.mock.calls[1][0];
      const secondParams = parseUrl(secondCall.url).params;
      expect(secondParams.get("query")).toBe("today");
      expect(secondParams.get("cursor")).toBe("cursor-1");
    });

    it("returns empty array when results are empty", async () => {
      const fetcher = makeFetcher();
      fetcher.fetch.mockResolvedValueOnce(makePaginatedResponse([]));

      const client = new TodoistApiClient("test-token", fetcher);
      const tasks = await client.getTasks();

      expect(tasks).toHaveLength(0);
    });
  });

  describe("createTask", () => {
    it("sends POST with correct body serialization including options", async () => {
      const fetcher = makeFetcher();
      fetcher.fetch.mockResolvedValueOnce({
        statusCode: 200,
        body: JSON.stringify(makeTask({ content: "New task", project_id: "proj-1", priority: 4 })),
      });

      const client = new TodoistApiClient("test-token", fetcher);
      const task = await client.createTask("New task", {
        projectId: "proj-1",
        priority: 4,
      });

      expect(task.content).toBe("New task");

      const call = fetcher.fetch.mock.calls[0][0];
      expect(call.method).toBe("POST");
      const { pathname } = parseUrl(call.url);
      expect(pathname).toBe("/api/v1/tasks");
      expect(call.headers["Content-Type"]).toBe("application/json");

      const body = JSON.parse(call.body as string);
      expect(body.content).toBe("New task");
      expect(body.project_id).toBe("proj-1");
      expect(body.priority).toBe(4);
    });

    it("sends POST with only content when no options provided", async () => {
      const fetcher = makeFetcher();
      fetcher.fetch.mockResolvedValueOnce({
        statusCode: 200,
        body: JSON.stringify(makeTask({ content: "Simple task" })),
      });

      const client = new TodoistApiClient("test-token", fetcher);
      await client.createTask("Simple task");

      const call = fetcher.fetch.mock.calls[0][0];
      const body = JSON.parse(call.body as string);
      expect(body.content).toBe("Simple task");
      expect(Object.keys(body)).toEqual(["content"]);
    });
  });

  describe("closeTask", () => {
    it("sends POST to /tasks/{id}/close without body or Content-Type", async () => {
      const fetcher = makeFetcher();
      fetcher.fetch.mockResolvedValueOnce({ statusCode: 204, body: "" });

      const client = new TodoistApiClient("test-token", fetcher);
      await client.closeTask("task-789");

      const call = fetcher.fetch.mock.calls[0][0];
      expect(call.method).toBe("POST");
      const { pathname } = parseUrl(call.url);
      expect(pathname).toBe("/api/v1/tasks/task-789/close");
      expect(call.body).toBeUndefined();
      expect(call.headers["Content-Type"]).toBeUndefined();
    });
  });

  describe("getUser", () => {
    it("calls /user endpoint and parses response", async () => {
      const fetcher = makeFetcher();
      fetcher.fetch.mockResolvedValueOnce({
        statusCode: 200,
        body: JSON.stringify({ is_premium: true }),
      });

      const client = new TodoistApiClient("test-token", fetcher);
      const user = await client.getUser();

      expect(user.isPremium).toBe(true);

      const call = fetcher.fetch.mock.calls[0][0];
      expect(call.method).toBe("GET");
      const { pathname } = parseUrl(call.url);
      expect(pathname).toBe("/api/v1/user");
    });
  });

  describe("sync", () => {
    it("calls /sync with JSON body containing snakified params", async () => {
      const fetcher = makeFetcher();
      fetcher.fetch.mockResolvedValueOnce({
        statusCode: 200,
        body: JSON.stringify({
          sync_token: "new-token",
          projects: [],
          sections: [],
          labels: [],
        }),
      });

      const client = new TodoistApiClient("test-token", fetcher);
      const result = await client.sync("old-token");

      expect(result.syncToken).toBe("new-token");

      const call = fetcher.fetch.mock.calls[0][0];
      expect(call.method).toBe("POST");
      expect(call.headers["Content-Type"]).toBe("application/json");

      const body = JSON.parse(call.body as string);
      expect(body.sync_token).toBe("old-token");
      expect(body.resource_types).toEqual(["projects", "labels", "sections"]);

      const { pathname } = parseUrl(call.url);
      expect(pathname).toBe("/api/v1/sync");
    });
  });

  describe("error handling", () => {
    it("throws TodoistApiError with correct statusCode on 4xx", async () => {
      const fetcher = makeFetcher();
      fetcher.fetch.mockResolvedValueOnce({
        statusCode: 401,
        body: "Unauthorized",
      });

      const client = new TodoistApiClient("test-token", fetcher);
      await expect(client.getTasks()).rejects.toSatisfy((e) => {
        expect(e).toBeInstanceOf(TodoistApiError);
        expect((e as TodoistApiError).statusCode).toBe(401);
        return true;
      });
    });

    it("throws TodoistApiError with correct statusCode on 5xx", async () => {
      const fetcher = makeFetcher();
      fetcher.fetch.mockResolvedValueOnce({
        statusCode: 500,
        body: "Internal Server Error",
      });

      const client = new TodoistApiClient("test-token", fetcher);
      await expect(client.getTasks()).rejects.toSatisfy((e) => {
        expect(e).toBeInstanceOf(TodoistApiError);
        expect((e as TodoistApiError).statusCode).toBe(500);
        return true;
      });
    });
  });

  describe("authorization", () => {
    it("includes Bearer token in Authorization header for all requests", async () => {
      const fetcher = makeFetcher();
      fetcher.fetch.mockResolvedValueOnce(makePaginatedResponse([makeTask()]));

      const client = new TodoistApiClient("my-secret-token", fetcher);
      await client.getTasks();

      const call = fetcher.fetch.mock.calls[0][0];
      expect(call.headers.Authorization).toBe("Bearer my-secret-token");
    });
  });
});
