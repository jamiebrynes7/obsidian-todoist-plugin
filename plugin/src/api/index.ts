import snakify from "snakify-ts";
import { z } from "zod";

import type { SyncResponse, SyncToken } from "@/api/domain/sync";
import { syncResponseSchema } from "@/api/domain/sync";
import type { CreateTaskParams, Task, TaskId } from "@/api/domain/task";
import { taskSchema } from "@/api/domain/task";
import type { UserInfo } from "@/api/domain/user";
import { userInfoSchema } from "@/api/domain/user";
import { type RequestParams, StatusCode, type WebFetcher, type WebResponse } from "@/api/fetcher";
import { parseApiResponse } from "@/api/validation";
import { debug } from "@/log";

export class TodoistApiClient {
  private readonly token: string;
  private readonly fetcher: WebFetcher;

  constructor(token: string, fetcher: WebFetcher) {
    this.token = token;
    this.fetcher = fetcher;
  }

  public async getTasks(filter?: string): Promise<Task[]> {
    if (filter !== undefined) {
      return await this.doPaginated("/tasks/filter", taskSchema, { query: filter });
    }

    return await this.doPaginated("/tasks", taskSchema);
  }

  public async createTask(content: string, options?: CreateTaskParams): Promise<Task> {
    const body = snakify({
      content,
      ...(options ?? {}),
    });
    const response = await this.do("/tasks", "POST", { json: body });
    return parseApiResponse(taskSchema, response.body);
  }

  public async closeTask(id: TaskId): Promise<void> {
    await this.do(`/tasks/${id}/close`, "POST", {});
  }

  public async getUser(): Promise<UserInfo> {
    const response = await this.do("/user", "GET", {});
    return parseApiResponse(userInfoSchema, response.body);
  }

  public async sync(token: SyncToken): Promise<SyncResponse> {
    const queryParams = snakify({
      syncToken: token,
      resourceTypes: JSON.stringify(["projects", "labels", "sections"]),
    });
    const response = await this.do("/sync", "POST", { queryParams });
    return parseApiResponse(syncResponseSchema, response.body);
  }

  private async doPaginated<T>(
    path: string,
    schema: z.ZodType<T>,
    params?: Record<string, string>,
  ): Promise<T[]> {
    const allResults: T[] = [];
    let cursor: string | null = null;

    const paginatedSchema = z.object({
      results: z.array(schema),
      nextCursor: z.string().nullable(),
    });

    do {
      const queryParams: Record<string, string> = {
        ...(params ?? {}),
      };

      if (cursor) {
        queryParams.cursor = cursor;
      }

      const response = await this.do(path, "GET", { queryParams });
      const paginatedResponse = parseApiResponse(paginatedSchema, response.body);

      allResults.push(...paginatedResponse.results);
      cursor = paginatedResponse.nextCursor;
    } while (cursor);

    return allResults;
  }

  private async do(
    path: string,
    method: string,
    opts: { json?: object; queryParams?: Record<string, string> },
  ): Promise<WebResponse> {
    let queryString = "";
    if (opts.queryParams) {
      const urlParams = new URLSearchParams(opts.queryParams);
      queryString = `?${urlParams.toString()}`;
    }

    const params: RequestParams = {
      url: `https://api.todoist.com/api/v1${path}${queryString}`,
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    };

    if (opts.json !== undefined) {
      params.body = JSON.stringify(opts.json);
      params.headers["Content-Type"] = "application/json";
    }

    debug({
      msg: "Sending Todoist API request",
      context: params,
    });

    const response = await this.fetcher.fetch(params);

    debug({
      msg: "Received Todoist API response",
      context: response,
    });

    if (StatusCode.isError(response.statusCode)) {
      throw new TodoistApiError(params, response);
    }

    return response;
  }
}

export class TodoistApiError extends Error {
  public statusCode: StatusCode;

  constructor(request: RequestParams, response: WebResponse) {
    const message = `[${request.method}] ${request.url} returned '${response.statusCode}: ${response.body}`;
    super(message);
    this.statusCode = response.statusCode;
  }
}
