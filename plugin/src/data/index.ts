import { type TodoistApiClient, TodoistApiError } from "../api";
import type { Label, LabelId } from "../api/domain/label";
import type { Project, ProjectId } from "../api/domain/project";
import type { Section, SectionId } from "../api/domain/section";
import type { CreateTaskParams, Task as ApiTask, TaskId } from "../api/domain/task";
import { Maybe } from "../utils/maybe";
import { Repository, type RepositoryReader } from "./repository";
import { SubscriptionManager, type UnsubscribeCallback } from "./subscriptions";
import type { Task } from "./task";

export enum QueryErrorKind {
  BadRequest = 0,
  Unauthorized = 1,
  Forbidden = 2,
  Unknown = 3,
}

export type SubscriptionResult =
  | { type: "success"; tasks: Task[] }
  | { type: "error"; kind: QueryErrorKind };
export type OnSubscriptionChange = (result: SubscriptionResult) => void;
export type Refresh = () => Promise<void>;

type DataAccessor = {
  projects: RepositoryReader<ProjectId, Project>;
  sections: RepositoryReader<SectionId, Section>;
  labels: RepositoryReader<LabelId, Label>;
};

export class TodoistAdapter {
  public actions = {
    closeTask: async (id: TaskId) => await this.closeTask(id),
    createTask: async (content: string, params: CreateTaskParams) =>
      await this.api.withInner((api) => api.createTask(content, params)),
  };

  private readonly api: Maybe<TodoistApiClient> = Maybe.Empty();
  private readonly projects: Repository<ProjectId, Project>;
  private readonly sections: Repository<SectionId, Section>;
  private readonly labels: Repository<LabelId, Label>;
  private readonly subscriptions: SubscriptionManager<Subscription>;

  private readonly tasksPendingClose: TaskId[];

  private hasSynced = false;

  constructor() {
    this.projects = new Repository(() => this.api.withInner((api) => api.getProjects()));
    this.sections = new Repository(() => this.api.withInner((api) => api.getSections()));
    this.labels = new Repository(() => this.api.withInner((api) => api.getLabels()));
    this.subscriptions = new SubscriptionManager<Subscription>();
    this.tasksPendingClose = [];
  }

  public isReady(): boolean {
    return this.api.hasValue() && this.hasSynced;
  }

  public async initialize(api: TodoistApiClient) {
    this.api.insert(api);
    await this.sync();
  }

  public async sync(): Promise<void> {
    if (!this.api.hasValue()) {
      return;
    }

    await this.projects.sync();
    await this.sections.sync();
    await this.labels.sync();

    for (const subscription of this.subscriptions.list()) {
      await subscription.update();
    }

    this.hasSynced = true;
  }

  public data(): DataAccessor {
    return {
      projects: this.projects,
      sections: this.sections,
      labels: this.labels,
    };
  }

  public subscribe(query: string, callback: OnSubscriptionChange): [UnsubscribeCallback, Refresh] {
    const fetcher = this.buildQueryFetcher(query);
    const subscription = new Subscription(callback, fetcher, () => true);
    return [this.subscriptions.subscribe(subscription), subscription.update];
  }

  private buildQueryFetcher(query: string): SubscriptionFetcher {
    return async () => {
      if (!this.api.hasValue()) {
        return [];
      }
      const data = await this.api.withInner((api) => api.getTasks(query));
      const hydrated = data.map((t) => this.hydrate(t));
      return hydrated;
    };
  }

  private hydrate(apiTask: ApiTask): Task {
    const project = this.projects.byId(apiTask.projectId);
    const section = apiTask.sectionId
      ? this.sections.byId(apiTask.sectionId) ?? makeUnknownSection(apiTask.sectionId)
      : undefined;

    return {
      id: apiTask.id,
      createdAt: apiTask.createdAt,

      content: apiTask.content,
      description: apiTask.description,

      project: project ?? makeUnknownProject(apiTask.projectId),
      section: section,
      parentId: apiTask.parentId ?? undefined,

      labels: apiTask.labels,
      priority: apiTask.priority,

      due: apiTask.due ?? undefined,
      order: apiTask.order,
    };
  }

  private async closeTask(id: TaskId): Promise<void> {
    this.tasksPendingClose.push(id);

    for (const subscription of this.subscriptions.list()) {
      subscription.callback();
    }

    try {
      this.api.withInner((api) => api.closeTask(id));
      this.tasksPendingClose.remove(id);

      for (const subscription of this.subscriptions.list()) {
        subscription.remove(id);
      }
    } catch (error: unknown) {
      this.tasksPendingClose.remove(id);

      for (const subscription of this.subscriptions.list()) {
        subscription.callback();
      }

      throw error;
    }
  }
}

const makeUnknownProject = (id: string): Project => {
  return {
    id,
    parentId: null,
    name: "Unknown Project",
    order: Number.MAX_SAFE_INTEGER,
    isInboxProject: false,
    color: "grey",
  };
};

const makeUnknownSection = (id: string): Section => {
  return {
    id,
    projectId: "unknown-project",
    name: "Unknown Section",
    order: Number.MAX_SAFE_INTEGER,
  };
};

type SubscriptionFetcher = () => Promise<Task[]>;

class Subscription {
  private readonly userCallback: OnSubscriptionChange;
  private readonly fetch: SubscriptionFetcher;
  private readonly filter: () => boolean;

  private result: SubscriptionResult = { type: "success", tasks: [] };

  constructor(
    userCallback: OnSubscriptionChange,
    fetch: SubscriptionFetcher,
    filter: () => boolean,
  ) {
    this.userCallback = userCallback;
    this.fetch = fetch;
    this.filter = filter;
  }

  public update = async () => {
    try {
      const data = await this.fetch();
      this.result = { type: "success", tasks: data };
    } catch (error: unknown) {
      console.error(`Failed to refresh task query: ${error}`);

      const result: SubscriptionResult = {
        type: "error",
        kind: QueryErrorKind.Unknown,
      };
      if (error instanceof TodoistApiError) {
        switch (error.statusCode) {
          case 400:
            result.kind = QueryErrorKind.BadRequest;
            break;
          case 401:
            result.kind = QueryErrorKind.Unauthorized;
            break;
          case 403:
            result.kind = QueryErrorKind.Forbidden;
            break;
        }
      }

      this.result = result;
    }

    this.callback();
  };

  public callback = () => {
    // Apply filtering, without mutating the actual state of the result.
    const result = { ...this.result };
    if (result.type === "success") {
      result.tasks = result.tasks.filter(this.filter);
    }
    this.userCallback(result);
  };

  public remove(id: TaskId) {
    if (this.result.type !== "success") {
      return;
    }

    this.result.tasks = this.result.tasks.filter((task) => task.id !== id);
    this.callback();
  }
}
