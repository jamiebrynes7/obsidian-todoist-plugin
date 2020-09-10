import moment, { Moment, CalendarSpec } from "moment";

export class TodoistApi {
  private token: string;
  private projects: Map<ProjectID, string>;
  private sections: Map<SectionID, string>;

  constructor(token: string) {
    this.token = token;
    this.projects = new Map<ProjectID, string>();
    this.sections = new Map<SectionID, string>();
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
    return Task.buildTree(tasks, this.projects, this.sections);
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

  async fetchMetadata() : Promise<void> {
    const projects = await this.getProjects();
    projects.forEach((prj) => this.projects.set(prj.id, prj.name));

    const sections = await this.getSections();
    sections.forEach((sect) => this.sections.set(sect.id, sect.name));
  }

  private async getProjects() : Promise<IApiProject[]> {
    const url = `https://api.todoist.com/rest/v1/projects`;

    const result = await fetch(url, {
      headers: new Headers({
        Authorization: `Bearer ${this.token}`,
      }),
      method: "GET"
    });

    return (await result.json()) as IApiProject[];
  }

  private async getSections() : Promise<IApiSection[]> {
    const url = `https://api.todoist.com/rest/v1/sections`;

    const result = await fetch(url, {
      headers: new Headers({
        Authorization: `Bearer ${this.token}`,
      }),
      method: "GET"
    });

    return (await result.json()) as IApiSection[];
  }
}

export type ID = number;
export type ProjectID = number;
export type SectionID = number;

export interface IApiTask {
  id: ID;
  project_id: ProjectID,
  section_id: SectionID,
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

export interface IApiProject {
  id: ProjectID,
  parent_id?: ProjectID,
  order: number,
  name: string
}

export interface IApiSection {
  id: SectionID,
  project_id: ProjectID,
  order: number,
  name: string
}

export class Task {
  public id: ID;
  public priority: number;
  public content: string;
  public order: number;
  public project: string;
  public section?: string;
  
  public parent?: Task;
  public children: Task[];

  public date?: string;
  public hasTime?: boolean;
  public rawDatetime?: Moment;

  private static dateOnlyCalendarSpec: CalendarSpec = {
    sameDay: '[Today]',
    nextDay: '[Tomorrow]',
    nextWeek: 'dddd',
    lastDay: '[Yesterday]',
    lastWeek: '[Last] dddd',
    sameElse: 'MMM Do'
  };

  constructor(raw: IApiTask, project: string, section?: string) {
    this.id = raw.id;
    this.priority = raw.priority;
    this.content = raw.content;
    this.order = raw.order;
    this.project = project;
    this.section = section;

    this.children = [];

    if (raw.due) {
      if (raw.due.datetime) {
        this.hasTime = true;
        this.rawDatetime = moment(raw.due.datetime);
        this.date = this.rawDatetime.calendar();
      } else {
        this.hasTime = false;
        this.rawDatetime = moment(raw.due.date);
        this.date = this.rawDatetime.calendar(Task.dateOnlyCalendarSpec);
      }
    }
  }

  isOverdue(): boolean {
    if (!this.rawDatetime) {
      return false;
    }

    if (this.hasTime) {
      return this.rawDatetime.isBefore();
    }

    return this.rawDatetime.clone().add(1, 'day').isBefore();
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
          if (this.rawDatetime && !other.rawDatetime) {
            return -1;
          } else if (!this.rawDatetime && other.rawDatetime) {
            return 1;
          } else if (!this.rawDatetime && !other.rawDatetime) {
            continue;
          }

          // Now compare dates.
          if (this.rawDatetime.isAfter(other.rawDatetime, 'day')) {
            return 1;
          } else if (this.rawDatetime.isBefore(other.rawDatetime, 'day')) {
            return -1;
          }

          // We are the same day, lets look at time.
          if (this.hasTime && !other.hasTime) {
            return -1;
          } else if (!this.hasTime && other.hasTime) {
            return 1;
          } else if (!this.hasTime && !this.hasTime) {
            continue;
          }

          return this.rawDatetime.isBefore(other.rawDatetime) ? -1 : 1;
      }
    }

    return this.order - other.order;
  }

  static buildTree(tasks: IApiTask[], projects: Map<ProjectID, string>, sections: Map<SectionID, string>): Task[] {
    const mapping = new Map<ID, Task>();

    tasks.forEach((task) => mapping.set(task.id, new Task(task, projects.get(task.project_id), sections.get(task.section_id))));
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
