import type { Label } from "@/api/domain/label";
import type { Project } from "@/api/domain/project";
import type { Section } from "@/api/domain/section";
import type { CreateTaskParams, Task, TaskId } from "@/api/domain/task";
import type { RequestParams, WebFetcher, WebResponse } from "@/api/fetcher";
import debug from "@/log";
import camelize from "camelize-ts";
import snakify from "snakify-ts";

export class TodoistApiClient {
  private token: string;
  private fetcher: WebFetcher;

  constructor(token: string, fetcher: WebFetcher) {
    this.token = token;
    this.fetcher = fetcher;
  }

  public async getTasks(filter?: string): Promise<Task[]> {
    let path = "/tasks";

    if (filter !== undefined) {
      path += `?filter=${encodeURIComponent(filter)}`;
    }

    const response = await this.do(path, "GET");

    return camelize(JSON.parse(response.body)) as Task[];
  }

  public async createTask(content: string, options?: CreateTaskParams): Promise<void> {
    const body = snakify({ content: content, ...(options ?? {}) });
    await this.do("/tasks", "POST", body);
  }

  public async closeTask(id: TaskId): Promise<void> {
    await this.do(`/tasks/${id}/close`, "POST");
  }

  public async getProjects(): Promise<Project[]> {
    const response = await this.do("/projects", "GET");
    return camelize(JSON.parse(response.body)) as Project[];
  }

  public async getSections(): Promise<Section[]> {
    const response = await this.do("/sections", "GET");
    return camelize(JSON.parse(response.body)) as Section[];
  }

  public async getLabels(): Promise<Label[]> {
    const response = await this.do("/labels", "GET");
    return camelize(JSON.parse(response.body)) as Label[];
  }

  private async do(path: string, method: string, json?: object): Promise<WebResponse> {
    const params: RequestParams = {
      url: `https://api.todoist.com/rest/v2${path}`,
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
