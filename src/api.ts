export class TodoistApi {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async getTasks(filter?: string): Promise<ITask[]> {
    let url = "https://api.todoist.com/rest/v1/tasks";

    if (filter) {
      url += `?filter=${encodeURIComponent(filter)}`;
    }

    const result = await fetch(url, {
      headers: new Headers({
        Authorization: `Bearer ${this.token}`,
      }),
    });

    return (await result.json()) as ITask[];
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

export type ID = string;

export interface ITask {
  id: ID;
  priority: number;
  content: string;
  order: number;
}
