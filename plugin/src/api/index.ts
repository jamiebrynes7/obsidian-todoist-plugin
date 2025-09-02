import camelize from "camelize-ts";
import snakify from "snakify-ts";

import type { Label } from "@/api/domain/label";
import type { Project } from "@/api/domain/project";
import type { Section } from "@/api/domain/section";
import type { CreateTaskParams, Task, TaskId } from "@/api/domain/task";
import type { RequestParams, WebFetcher, WebResponse } from "@/api/fetcher";
import debug from "@/log";

type PaginatedResponse<T> = {
  results: T[];
  nextCursor: string | null;
};

export class TodoistApiClient {
  private token: string;
  private fetcher: WebFetcher;

  constructor(token: string, fetcher: WebFetcher) {
    this.token = token;
    this.fetcher = fetcher;
  }

  public async getTasks(filter?: string): Promise<Task[]> {
    if (filter !== undefined) {
      return await this.doPaginated<Task>("/tasks/filter", { query: filter });
    } else {
      return await this.doPaginated<Task>("/tasks");
    }
  }

  public async createTask(content: string, options?: CreateTaskParams, useQuickAddEndpoint?: boolean): Promise<void> {
    if (useQuickAddEndpoint) {
      // Quick add endpoint expects a different payload
      const body = new URLSearchParams({
        text: content,
        ...((options?.description ? { description: options.description } : {})),
        ...((options?.projectId ? { project_id: options.projectId } : {})),
        ...((options?.sectionId ? { section_id: options.sectionId } : {})),
        ...((options?.dueDate ? { due_date: options.dueDate } : {})),
        ...((options?.dueDatetime ? { due_datetime: options.dueDatetime } : {})),
        ...((options?.labels ? { labels: options.labels.join(",") } : {})),
        ...((options?.priority ? { priority: String(options.priority) } : {})),
      });
      await this.doQuickAdd("https://api.todoist.com/sync/v9/quick/add", body);
    } else {
      const body = snakify({
        content: content,
        ...(options ?? {}),
      });
      await this.do("/tasks", "POST", body);
    }
  }

  private async doQuickAdd(url: string, body: URLSearchParams): Promise<WebResponse> {
    const params: RequestParams = {
      url,
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    };

    debug({
      msg: "Sending Todoist Quick Add API request",
      context: params,
    });

    const response = await this.fetcher.fetch(params);

    debug({
      msg: "Received Todoist Quick Add API response",
      context: response,
    });

    if (response.statusCode >= 400) {
      throw new TodoistApiError(params, response);
    }

    return response;
  }

  public async closeTask(id: TaskId): Promise<void> {
    await this.do(`/tasks/${id}/close`, "POST");
  }

  public async getProjects(): Promise<Project[]> {
    return await this.doPaginated<Project>("/projects");
  }

  public async getSections(): Promise<Section[]> {
    return await this.doPaginated<Section>("/sections");
  }

  public async getLabels(): Promise<Label[]> {
    return await this.doPaginated<Label>("/labels");
  }

  private async doPaginated<T>(path: string, params?: Record<string, string>): Promise<T[]> {
    const allResults: T[] = [];
    let cursor: string | null = null;

    do {
      const queryParams = new URLSearchParams(params);
      if (cursor) {
        queryParams.set("cursor", cursor);
      }

      const queryString = queryParams.toString();
      const fullPath = queryString ? `${path}?${queryString}` : path;

      const response = await this.do(fullPath, "GET");
      const paginatedResponse = camelize(JSON.parse(response.body)) as PaginatedResponse<T>;

      allResults.push(...paginatedResponse.results);
      cursor = paginatedResponse.nextCursor;
    } while (cursor);

    return allResults;
  }

  private async do(path: string, method: string, json?: object): Promise<WebResponse> {
    const params: RequestParams = {
      url: `https://api.todoist.com/api/v1${path}`,
      method: method,
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    };

    if (json !== undefined) {
      params.body = JSON.stringify(json);
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

    if (response.statusCode >= 400) {
      throw new TodoistApiError(params, response);
    }

    return response;
  }
}

export class TodoistApiError extends Error {
  public statusCode: number;

  constructor(request: RequestParams, response: WebResponse) {
    const message = `[${request.method}] ${request.url} returned '${response.statusCode}: ${response.body}`;
    super(message);
    this.statusCode = response.statusCode;
  }
}
