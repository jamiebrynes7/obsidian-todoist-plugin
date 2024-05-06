type SubscriptionId = number;
export type UnsubscribeCallback = () => void;

export class SubscriptionManager<T> {
  private readonly subscriptions: Map<SubscriptionId, T> = new Map();
  private generator: Generator<SubscriptionId> = subscriptionIdGenerator();

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
