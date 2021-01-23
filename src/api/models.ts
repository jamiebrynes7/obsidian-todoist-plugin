import moment, { Moment, CalendarSpec } from "moment";
import {
  ITaskRaw,
  IProjectRaw,
  ISectionRaw,
  UnknownProject,
  UnknownSection,
} from "./raw_models";
import type { ITodoistMetadata } from "./api";
import { ExtendedMap } from "../utils";

export type ID = number;
export type ProjectID = number;
export type SectionID = number;
export type LabelID = number;

export class Task {
  public id: ID;
  public priority: number;
  public content: string;
  public order: number;
  public projectID: ProjectID;
  public sectionID?: SectionID;
  public labelIDs: LabelID[];

  public parent?: Task;
  public children: Task[];

  public date?: string;
  public hasTime?: boolean;
  public rawDatetime?: Moment;

  private static dateOnlyCalendarSpec: CalendarSpec = {
    sameDay: "[Today]",
    nextDay: "[Tomorrow]",
    nextWeek: "dddd",
    lastDay: "[Yesterday]",
    lastWeek: "[Last] dddd",
    sameElse: "MMM Do",
  };

  constructor(raw: ITaskRaw) {
    this.id = raw.id;
    this.priority = raw.priority;
    this.content = raw.content;
    this.order = raw.order;
    this.projectID = raw.project_id;
    this.sectionID = raw.section_id != 0 ? raw.section_id : null;
    this.labelIDs = raw.label_ids;

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

  public count(): number {
    return 1 + this.children.reduce((sum, task) => sum + task.count(), 0);
  }

  public isOverdue(): boolean {
    if (!this.rawDatetime) {
      return false;
    }

    if (this.hasTime) {
      return this.rawDatetime.isBefore();
    }

    return this.rawDatetime.clone().add(1, "day").isBefore();
  }

  public compareTo(other: Task, sorting_options: string[]): number {
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
          if (this.rawDatetime.isAfter(other.rawDatetime, "day")) {
            return 1;
          } else if (this.rawDatetime.isBefore(other.rawDatetime, "day")) {
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

  static buildTree(tasks: ITaskRaw[]): Task[] {
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

export class Project {
  public readonly projectID: ProjectID;
  public readonly parentID?: ProjectID;
  public readonly order: number;

  public tasks: Task[];
  public subProjects: Project[];
  public sections: Section[];

  private parent?: Project;

  constructor(raw: IProjectRaw) {
    this.projectID = raw.id;
    this.parentID = raw.parent_id;
    this.order = raw.order;

    this.tasks = [];
    this.subProjects = [];
    this.sections = [];
  }

  public count(): number {
    return (
      this.tasks.reduce((sum, task) => sum + task.count(), 0) +
      this.subProjects.reduce((sum, prj) => sum + prj.count(), 0) +
      this.sections.reduce((sum, section) => sum + section.count(), 0)
    );
  }

  private sort() {
    this.subProjects = this.subProjects.sort(
      (first, second) => first.order - second.order
    );
    this.sections = this.sections.sort(
      (first, second) => first.order - second.order
    );
  }

  static buildProjectTree(
    tasks: ITaskRaw[],
    metadata: ITodoistMetadata
  ): Project[] {
    const projects = new ExtendedMap<ProjectID, Intermediate<Project>>();
    const sections = new ExtendedMap<SectionID, Intermediate<Section>>();

    const unknownProject: Intermediate<Project> = {
      result: new Project(UnknownProject),
      tasks: [],
    };

    const unknownSection: Intermediate<Section> = {
      result: new Section(UnknownSection),
      tasks: [],
    };

    tasks.forEach((task) => {
      const project =
        projects.get_or_maybe_insert(task.project_id, () => {
          const project = metadata.projects.get(task.project_id);

          if (project) {
            return {
              result: new Project(project),
              tasks: [],
            };
          } else {
            return null;
          }
        }) ?? unknownProject;

      if (task.section_id != 0) {
        // The task has an associated section, so we file it under there.
        const section =
          sections.get_or_maybe_insert(task.section_id, () => {
            const section = metadata.sections.get(task.section_id);

            if (section) {
              return {
                result: new Section(section),
                tasks: [],
              };
            } else {
              return null;
            }
          }) ?? unknownSection;

        section.tasks.push(task);
        return;
      }

      project.tasks.push(task);
    });

    if (unknownProject.tasks.length > 0) {
      projects.set(unknownProject.result.projectID, unknownProject);
    }

    if (unknownSection.tasks.length > 0) {
      projects.set(unknownProject.result.projectID, unknownProject);
      sections.set(unknownSection.result.sectionID, unknownSection);
    }

    // Attach parents for projects.
    for (let project of projects.values()) {
      project.result.tasks = Task.buildTree(project.tasks);

      if (!project.result.parentID) {
        continue;
      }

      const parent = projects.get(project.result.parentID);

      if (parent) {
        parent.result.subProjects.push(project.result);
        project.result.parent = parent.result;
      }
    }

    // Attach parents for sections.
    for (let section of sections.values()) {
      section.result.tasks = Task.buildTree(section.tasks);

      const project = projects.get(section.result.projectID);
      project.result.sections.push(section.result);
    }

    projects.forEach((prj) => prj.result.sort());

    return Array.from(projects.values())
      .map((prj) => prj.result)
      .filter((prj) => prj.parent == null);
  }
}

export class Section {
  public readonly sectionID: SectionID;
  public readonly projectID: ProjectID;
  public readonly order: number;

  public tasks: Task[];

  constructor(raw: ISectionRaw) {
    this.sectionID = raw.id;
    this.projectID = raw.project_id;
    this.order = raw.order;
  }

  public count(): number {
    return this.tasks.reduce((sum, task) => sum + task.count(), 0);
  }
}

interface Intermediate<T> {
  result: T;
  tasks: ITaskRaw[];
}
