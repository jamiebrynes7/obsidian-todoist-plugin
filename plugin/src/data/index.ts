import { TodoistApiError, type TodoistApiClient } from "../api";
import type { Label, LabelId } from "../api/domain/label";
import type { Project, ProjectId } from "../api/domain/project";
import type { Section, SectionId } from "../api/domain/section";
import { Repository, type RepositoryReader } from "./repository";
import type { Task } from "./task";
import type { Task as ApiTask, CreateTaskParams, TaskId } from "../api/domain/task";
import { SubscriptionManager, type UnsubscribeCallback } from "./subscriptions";
import { Maybe } from "../utils/maybe";

export enum QueryErrorKind {
  BadRequest,
  Unauthorized,
  Forbidden,
  Unknown,
}

type SubscriptionResult = { type: "success", tasks: Task[] } | { type: "error", kind: QueryErrorKind };
type OnSubscriptionChange = (result: SubscriptionResult) => void;
type Refresh = () => Promise<void>;

type DataAccessor = {
  projects: RepositoryReader<ProjectId, Project>,
  sections: RepositoryReader<SectionId, Section>,
  labels: RepositoryReader<LabelId, Label>,
}

type Actions = {
  closeTask: (id: TaskId) => Promise<void>,
  createTask: (content: string, params: CreateTaskParams) => Promise<void>,
};

export class TodoistAdapter {
  public actions: Actions = {
    closeTask: async (id) => await this.api.withInner(api => api.closeTask(id)),
    createTask: async (content, params) => await this.api.withInner(api => api.createTask(content, params)),
  }

  private readonly api: Maybe<TodoistApiClient> = Maybe.Empty();
  private readonly projects: Repository<ProjectId, Project>;
  private readonly sections: Repository<SectionId, Section>;
  private readonly labels: Repository<LabelId, Label>;
  private readonly subscriptions: SubscriptionManager<Refresh>;

  constructor() {
    this.projects = new Repository(() => this.api.withInner(api => api.getProjects()));
    this.sections = new Repository(() => this.api.withInner(api => api.getSections()));
    this.labels = new Repository(() => this.api.withInner(api => api.getLabels()));
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
    return [
      this.subscriptions.subscribe(refresh),
      refresh
    ];
  }

  private buildRefresher(query: string, callback: OnSubscriptionChange): Refresh {
    return async () => {
      if (!this.api.hasValue()) {
        return;
      }
      try {
        const data = await this.api.withInner(api => api.getTasks(query));
        const hydrated = data.map(t => this.hydrate(t));
        callback({ type: "success", tasks: hydrated });
      }
      catch (error: any) {
        console.error(`Failed to refresh task query: ${error}`);

        let result: SubscriptionResult = { type: "error", kind: QueryErrorKind.Unknown };
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
    const section = apiTask.sectionId ? this.sections.byId(apiTask.sectionId) : undefined;

    return {
      id: apiTask.id,
      createdAt: apiTask.createdAt,

      content: apiTask.content,
      description: apiTask.description,

      project: project,
      section: section,
      parentId: apiTask.parentId ?? undefined,

      labels: apiTask.labels,
      priority: apiTask.priority,

      due: apiTask.due ?? undefined,
      order: apiTask.order
    };
  }
}

