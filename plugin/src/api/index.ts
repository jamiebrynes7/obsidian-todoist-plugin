import camelize from "camelize-ts";
import snakify from "snakify-ts";

import type { SyncResponse, SyncToken } from "@/api/domain/sync";
import type { CreateTaskParams, Task, TaskId } from "@/api/domain/task";
import type { UserInfo } from "@/api/domain/user";
import { type RequestParams, StatusCode, type WebFetcher, type WebResponse } from "@/api/fetcher";
import { debug } from "@/log";

type PaginatedResponse<T> = {
  results: T[];
  nextCursor: string | null;
};

export class TodoistApiClient {
  private readonly token: string;
  private readonly fetcher: WebFetcher;

  constructor(token: string, fetcher: WebFetcher) {
    this.token = token;
    this.fetcher = fetcher;
  }

  public async getTasks(filter?: string): Promise<Task[]> {
    if (filter !== undefined) {
      return await this.doPaginated<Task>("/tasks/filter", { query: filter });
    }

    return await this.doPaginated<Task>("/tasks");
  }

  public async createTask(content: string, options?: CreateTaskParams): Promise<Task> {
    const body = snakify({
      content,
      ...(options ?? {}),
    });
    const response = await this.do("/tasks", "POST", { json: body });
    return camelize(JSON.parse(response.body)) as Task;
  }

  public async closeTask(id: TaskId): Promise<void> {
    await this.do(`/tasks/${id}/close`, "POST", {});
  }

  public async getUser(): Promise<UserInfo> {
    const response = await this.do("/user", "GET", {});
    return camelize(JSON.parse(response.body)) as UserInfo;
  }

  public async sync(token: SyncToken): Promise<SyncResponse> {
    const queryParams = snakify({
      syncToken: token,
      resourceTypes: JSON.stringify(["projects", "labels", "sections"]),
    });
    const response = await this.do("/sync", "POST", { queryParams });
    return camelize(JSON.parse(response.body)) as SyncResponse;
  }

  private async doPaginated<T>(path: string, params?: Record<string, string>): Promise<T[]> {
    const allResults: T[] = [];
    let cursor: string | null = null;

    do {
      const queryParams: Record<string, string> = {
        ...(params ?? {}),
      };

      if (cursor) {
        queryParams.cursor = cursor;
      }

      const response = await this.do(path, "GET", { queryParams });
      const paginatedResponse = camelize(JSON.parse(response.body)) as PaginatedResponse<T>;

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
