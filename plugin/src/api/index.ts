import type {
  CompletedTask,
  CompletedTasksResponse,
  GetCompletedTasksParams,
} from "@/api/domain/completedTask";
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
  private readonly syncBaseUrl = "https://api.todoist.com/sync/v9";
  private readonly restBaseUrl = "https://api.todoist.com/rest/v2";

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

  /**
   * Gets a list of completed tasks from Todoist using the sync API.
   */
  public async getCompletedTasks(params?: GetCompletedTasksParams): Promise<CompletedTask[]> {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.project_id) queryParams.set("project_id", params.project_id);
      if (params.limit) queryParams.set("limit", params.limit.toString());
      if (params.until) queryParams.set("until", params.until.toISOString());
      if (params.since) queryParams.set("since", params.since.toISOString());
    }

    queryParams.set("annotate_items", "true");

    const url = `${this.syncBaseUrl}/completed/get_all${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    debug({
      msg: "Sending Todoist API request",
      context: Object.fromEntries(queryParams.entries()),
    });

    const response = await this.fetcher.fetch({
      url,
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    debug({
      msg: "Received Todoist API response",
      context: response,
    });

    if (response.statusCode >= 400) {
      throw new TodoistApiError(
        { url, method: "GET", headers: { Authorization: `Bearer ${this.token}` } },
        response,
      );
    }

    const data = JSON.parse(response.body) as CompletedTasksResponse;
    return data.items;
  }

  private async do(path: string, method: string, json?: object): Promise<WebResponse> {
    const params: RequestParams = {
      url: `${this.restBaseUrl}${path}`,
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
