export interface RepositoryReader<T, U extends { id: T }> {
  byId(id: T): U | undefined;
  iter(): IterableIterator<U>;
}

export class Repository<T, U extends { id: T }> implements RepositoryReader<T, U> {
  private readonly data: Map<T, U> = new Map();
  private readonly fetchData: () => Promise<U[]>;

  constructor(refreshData: () => Promise<U[]>) {
    this.fetchData = refreshData;
  }

  public async sync(): Promise<void> {
    try {
      const items = await this.fetchData();

      this.data.clear();
      for (const elem of items) {
        this.data.set(elem.id, elem);
      }
    } catch (error: unknown) {
      console.error(`Failed to update repository: ${error}`);
    }
  }

  public byId(id: T): U | undefined {
    return this.data.get(id);
  }

  public iter(): IterableIterator<U> {
    return this.data.values();
  }
}
