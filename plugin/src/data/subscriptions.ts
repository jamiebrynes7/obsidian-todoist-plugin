import type { QueryErrorKind } from "@/data/errors";
import type { Task } from "@/data/task";

export type SubscriptionResult =
  | { type: "success"; tasks: Task[] }
  | { type: "error"; kind: QueryErrorKind }
  | { type: "not-ready" };

export type OnSubscriptionChange = (result: SubscriptionResult) => void;
export type Refresh = () => Promise<void>;

type SubscriptionId = number;
export type UnsubscribeCallback = () => void;

export class SubscriptionManager<T> {
  private readonly subscriptions: Map<SubscriptionId, T> = new Map();
  private readonly generator: Generator<SubscriptionId> = subscriptionIdGenerator();

  public subscribe(value: T): UnsubscribeCallback {
    const id = this.generator.next().value;
    this.subscriptions.set(id, value);

    return () => this.subscriptions.delete(id);
  }

  public list(): IterableIterator<T> {
    return this.subscriptions.values();
  }
}

function* subscriptionIdGenerator(): Generator<SubscriptionId> {
  let next = 0;

  while (true) {
    yield next++;
  }
}
