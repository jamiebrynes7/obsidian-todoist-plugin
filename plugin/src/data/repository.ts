interface RepositoryItem<Id> {
  id: Id;
  name: string;
  isDeleted: boolean;
  isArchived?: boolean;
}

export interface RepositoryReader<T, U> {
  byId(id: T): U | undefined;
  byName(name: string): U | undefined;
  iter(): IterableIterator<U>;

  iterActive(): IterableIterator<U>;
}

export interface RepositoryWriter<U> {
  applyDiff(changed: U[]): void;
}

export class Repository<T, U extends RepositoryItem<T>>
  implements RepositoryReader<T, U>, RepositoryWriter<U>
{
  private readonly data: Map<T, U> = new Map();

  public applyDiff(changed: U[]): void {
    for (const item of changed) {
      if (item.isDeleted) {
        this.data.delete(item.id);
        continue;
      }
      this.data.set(item.id, item);
    }
  }

  public byId(id: T): U | undefined {
    return this.data.get(id);
  }

  public byName(name: string): U | undefined {
    for (const item of this.iter()) {
      if (item.name === name) {
        return item;
      }
    }

    return undefined;
  }

  public iter(): IterableIterator<U> {
    return this.data.values();
  }

  public *iterActive(): IterableIterator<U> {
    for (const item of this.iter()) {
      if (item.isDeleted) {
        continue;
      }

      if (item.isArchived ?? false) {
        continue;
      }

      yield item;
    }
  }
}
