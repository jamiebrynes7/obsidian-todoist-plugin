export class TodoistApi {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async getTasks(filter?: string): Promise<Task[]> {
    let url = "https://api.todoist.com/rest/v1/tasks";

    if (filter) {
      url += `?filter=${encodeURIComponent(filter)}`;
    }

    const result = await fetch(url, {
      headers: new Headers({
        Authorization: `Bearer ${this.token}`,
      }),
    });

    const tasks = (await result.json()) as IApiTask[];
    return Task.buildTree(tasks);
  }

  async closeTask(id: ID): Promise<boolean> {
    const url = `https://api.todoist.com/rest/v1/tasks/${id}/close`;

    const result = await fetch(url, {
      headers: new Headers({
        Authorization: `Bearer ${this.token}`,
      }),
      method: "POST",
    });

    return result.ok;
  }
}

export type ID = number;

interface IApiTask {
  id: ID;
  priority: number;
  content: string;
  order: number;
  parent?: ID;
}

export class Task {
  public id: ID;
  public priority: number;
  public content: string;
  public order: number;
  public parent?: Task;
  public children: Task[];

  constructor(raw: IApiTask) {
    this.id = raw.id;
    this.priority = raw.priority;
    this.content = raw.content;
    this.order = raw.order;
    this.children = [];
  }

  static buildTree(tasks: IApiTask[]): Task[] {
    const mapping = new Map<ID, Task>();

    tasks.forEach((task) => mapping.set(task.id, new Task(task)));
    tasks.forEach((task) => {
      if (task.parent == null || !mapping.has(task.parent)) {
        return;
      }

      const self = mapping.get(task.id);
      const parent = mapping.get(task.parent);

      self.parent = parent;
      parent.children.push(self);
    });

    return Array.from(mapping.values()).filter((task) => task.parent == null);
  }
}
