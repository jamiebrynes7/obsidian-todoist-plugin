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

type SubscriptionResult =
  | { type: "success"; tasks: Task[] }
  | { type: "error"; kind: QueryErrorKind };
type OnSubscriptionChange = (result: SubscriptionResult) => void;
type Refresh = () => Promise<void>;

type DataAccessor = {
  projects: RepositoryReader<ProjectId, Project>;
  sections: RepositoryReader<SectionId, Section>;
  labels: RepositoryReader<LabelId, Label>;
};

type Actions = {
  closeTask: (id: TaskId) => Promise<void>;
  createTask: (content: string, params: CreateTaskParams) => Promise<void>;
};

export class TodoistAdapter {
  public actions: Actions = {
    closeTask: async (id) => await this.api.withInner((api) => api.closeTask(id)),
    createTask: async (content, params) =>
      await this.api.withInner((api) => api.createTask(content, params)),
  };

  private readonly api: Maybe<TodoistApiClient> = Maybe.Empty();
  private readonly projects: Repository<ProjectId, Project>;
  private readonly sections: Repository<SectionId, Section>;
  private readonly labels: Repository<LabelId, Label>;
  private readonly subscriptions: SubscriptionManager<Refresh>;

  constructor() {
    this.projects = new Repository(() => this.api.withInner((api) => api.getProjects()));
    this.sections = new Repository(() => this.api.withInner((api) => api.getSections()));
    this.labels = new Repository(() => this.api.withInner((api) => api.getLabels()));
    this.subscriptions = new SubscriptionManager<Refresh>();
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

    for (const refresh of this.subscriptions.listActive()) {
      await refresh();
    }
  }

  public data(): DataAccessor {
    return {
      projects: this.projects,
      sections: this.sections,
      labels: this.labels,
    };
  }

  public subscribe(query: string, callback: OnSubscriptionChange): [UnsubscribeCallback, Refresh] {
    const refresh = this.buildRefresher(query, callback);
    return [this.subscriptions.subscribe(refresh), refresh];
  }

  private buildRefresher(query: string, callback: OnSubscriptionChange): Refresh {
    return async () => {
      if (!this.api.hasValue()) {
        return;
      }
      try {
        const data = await this.api.withInner((api) => api.getTasks(query));
        const hydrated = data.map((t) => this.hydrate(t));
        callback({ type: "success", tasks: hydrated });
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
        callback(result);
      }
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
}

const makeUnknownProject = (id: string): Project => {
  return {
    id,
    parentId: null,
    name: "Unknown Project",
    order: Number.MAX_SAFE_INTEGER,
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
