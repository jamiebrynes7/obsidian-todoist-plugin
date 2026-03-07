import type { TodoistApiClient } from "@/api";
import type { Label, LabelId } from "@/api/domain/label";
import type { Project, ProjectId } from "@/api/domain/project";
import type { Section, SectionId } from "@/api/domain/section";
import type { SyncToken } from "@/api/domain/sync";
import type { Task as ApiTask, CreateTaskParams, TaskId } from "@/api/domain/task";
import type { UserInfo } from "@/api/domain/user";
import { mapApiError } from "@/data/errors";
import { type DataAccessor, hydrate } from "@/data/hydrate";
import { Repository } from "@/data/repository";
import {
  type OnSubscriptionChange,
  type Refresh,
  SubscriptionManager,
  type SubscriptionResult,
  type UnsubscribeCallback,
} from "@/data/subscriptions";
import type { Task } from "@/data/task";
import { Maybe } from "@/utils/maybe";

export { QueryErrorKind } from "@/data/errors";
export type { OnSubscriptionChange, Refresh, SubscriptionResult } from "@/data/subscriptions";

export class TodoistAdapter {
  public actions = {
    closeTask: async (id: TaskId) => await this.closeTask(id),
    createTask: async (content: string, params: CreateTaskParams): Promise<ApiTask> =>
      await this.api.withInner((api) => api.createTask(content, params)),
  };

  private readonly api: Maybe<TodoistApiClient> = Maybe.Empty();
  private readonly projects: Repository<ProjectId, Project>;
  private readonly sections: Repository<SectionId, Section>;
  private readonly labels: Repository<LabelId, Label>;
  private readonly subscriptions: SubscriptionManager<Subscription>;

  private readonly tasksPendingClose: TaskId[];
  private userInfo: UserInfo | undefined;

  private hasSynced = false;
  private syncToken: SyncToken = "*";

  constructor() {
    this.projects = new Repository<ProjectId, Project>();
    this.sections = new Repository<SectionId, Section>();
    this.labels = new Repository<LabelId, Label>();
    this.subscriptions = new SubscriptionManager<Subscription>();
    this.tasksPendingClose = [];
  }

  public isReady(): boolean {
    return this.api.hasValue() && this.hasSynced;
  }

  public isPremium(): boolean {
    return this.userInfo?.isPremium ?? true;
  }

  public async initialize(api: TodoistApiClient) {
    this.api.insert(api);
    await this.sync();
  }

  public async sync(): Promise<void> {
    if (!this.api.hasValue()) {
      return;
    }

    await Promise.all([this.syncUserInfo(), this.syncMetadata()]);

    for (const subscription of this.subscriptions.list()) {
      await subscription.update();
    }

    this.hasSynced = true;
  }

  private async syncUserInfo(): Promise<void> {
    try {
      if (!this.api.hasValue()) {
        return;
      }
      this.userInfo = await this.api.withInner((api) => api.getUser());
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    }
  }

  private async syncMetadata(): Promise<void> {
    try {
      if (!this.api.hasValue()) {
        return;
      }

      const response = await this.api.withInner((api) => api.sync(this.syncToken));

      this.projects.applyDiff(response.projects);
      this.sections.applyDiff(response.sections);
      this.labels.applyDiff(response.labels);
      this.syncToken = response.syncToken;
    } catch (error) {
      console.error("Failed to sync metadata:", error);
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
    const fetcher = this.buildQueryFetcher(query);
    const subscription = new Subscription(callback, fetcher, () => true);
    return [this.subscriptions.subscribe(subscription), subscription.update];
  }

  private buildQueryFetcher(query: string): SubscriptionFetcher {
    return async () => {
      if (!this.api.hasValue()) {
        return undefined;
      }
      const data = await this.api.withInner((api) => api.getTasks(query));
      const hydrated = data.map((t) => hydrate(t, this.data()));
      return hydrated;
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

type SubscriptionFetcher = () => Promise<Task[] | undefined>;

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
      if (data === undefined) {
        this.result = {
          type: "not-ready",
        };
      } else {
        this.result = {
          type: "success",
          tasks: data,
        };
      }
    } catch (error: unknown) {
      console.error(`Failed to refresh task query: ${error}`);

      this.result = {
        type: "error",
        kind: mapApiError(error),
      };
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
