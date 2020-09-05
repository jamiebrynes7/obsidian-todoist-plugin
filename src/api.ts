import moment, { Moment, CalendarSpec } from "moment";

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
  due?: {
    recurring: boolean,
    date: string,
    datetime?: string
  }
}

export class Task {
  public id: ID;
  public priority: number;
  public content: string;
  public order: number;
  public parent?: Task;
  public children: Task[];
  public date?: string;

  private datetime?: Moment;
  private hasTime?: boolean;

  private static dateOnlyCalendarSpec: CalendarSpec = {
    sameDay: '[Today]',
    nextDay: '[Tomorrow]',
    nextWeek: 'dddd',
    lastDay: '[Yesterday]',
    lastWeek: '[Last] dddd',
    sameElse: 'MMM Do'
  };

  constructor(raw: IApiTask) {
    this.id = raw.id;
    this.priority = raw.priority;
    this.content = raw.content;
    this.order = raw.order;
    this.children = [];

    if (raw.due) {
      if (raw.due.datetime) {
        this.hasTime = true;
        this.datetime = moment(raw.due.datetime);
        this.date = this.datetime.calendar();
      } else {
        this.hasTime = false;
        this.datetime = moment(raw.due.date);
        this.date = this.datetime.calendar(Task.dateOnlyCalendarSpec);
      }
    }
  }

  isOverdue(): boolean {
    if (!this.datetime) {
      return false;
    }

    if (this.hasTime) {
      return this.datetime.isBefore();
    }

    return this.datetime.add(1, 'day').isBefore();
  }

  compareTo(other: Task, sorting_options: string[]): number {
    for (let sort of sorting_options) {
      switch (sort) {
        case "priority":
          // Higher priority comes first.
          const diff = other.priority - this.priority;
          if (diff == 0) {
            continue;
          }

          return diff;
        case "date":
          // We want to sort using the following criteria:
          // 1. Any items without a datetime always are sorted after those with.
          // 2. Any items on the same day without time always are sorted after those with.
          if (this.datetime && !other.datetime) {
            return -1;
          } else if (!this.datetime && other.datetime) {
            return 1;
          } else if (!this.datetime && !other.datetime) {
            continue;
          }

          // Now compare dates.
          if (this.datetime.isAfter(other.datetime, 'day')) {
            return 1;
          } else if (this.datetime.isBefore(other.datetime, 'day')) {
            return -1;
          }

          // We are the same day, lets look at time.
          if (this.hasTime && !other.hasTime) {
            return -1;
          } else if (!this.hasTime && !other.hasTime) {
            return 1;
          } else if (!this.hasTime && !this.hasTime) {
            continue;
          }

          return this.datetime.isBefore(other.datetime) ? -1 : 1;
      }
    }

    return this.order - other.order;
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
