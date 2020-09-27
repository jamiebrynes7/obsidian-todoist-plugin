import { writable, Writable } from "svelte/store";
import debug from "../log";
import type {
  ITaskRaw,
  IProjectRaw,
  ISectionRaw,
  ILabelRaw,
} from "./raw_models";
import { Task, Project, ID, ProjectID, SectionID, LabelID } from "./models";
import { ExtendedMap } from "../utils";

export const UnknownProject: IProjectRaw = {
  id: -1,
  parent_id: null,
  order: -1,
  name: "Unknown project",
};

export const UnknownSection: ISectionRaw = {
  id: -1,
  project_id: -1,
  order: -1,
  name: "Unknown section",
};

export interface ITodoistMetadata {
  projects: ExtendedMap<ProjectID, IProjectRaw>;
  sections: ExtendedMap<SectionID, ISectionRaw>;
  labels: ExtendedMap<LabelID, string>;
}

export class TodoistApi {
  public metadata: Writable<ITodoistMetadata>;
  public metadataInstance: ITodoistMetadata;
  private token: string;

  constructor(token: string) {
    this.token = token;
    this.metadata = writable({
      projects: new ExtendedMap<ProjectID, IProjectRaw>(),
      sections: new ExtendedMap<SectionID, ISectionRaw>(),
      labels: new ExtendedMap<LabelID, string>(),
    });

    this.metadata.subscribe((value) => (this.metadataInstance = value));
  }

  async getTasks(filter?: string): Promise<Task[]> {
    let url = "https://api.todoist.com/rest/v1/tasks";

    if (filter) {
      url += `?filter=${encodeURIComponent(filter)}`;
    }

    debug(url);

    const result = await fetch(url, {
      headers: new Headers({
        Authorization: `Bearer ${this.token}`,
      }),
    });

    const tasks = (await result.json()) as ITaskRaw[];
    const tree = Task.buildTree(tasks);

    debug({
      msg: "Built task tree",
      context: tree,
    });

    return tree;
  }

  async getTasksGroupedByProject(filter?: string): Promise<Project[]> {
    let url = "https://api.todoist.com/rest/v1/tasks";

    if (filter) {
      url += `?filter=${encodeURIComponent(filter)}`;
    }

    const result = await fetch(url, {
      headers: new Headers({
        Authorization: `Bearer ${this.token}`,
      }),
    });

    // Force the metadata to update.
    await this.fetchMetadata();

    const tasks = (await result.json()) as ITaskRaw[];
    const tree = Project.buildProjectTree(tasks, this.metadataInstance);

    debug({
      msg: "Built project tree",
      context: tree,
    });

    return tree;
  }

  async closeTask(id: ID): Promise<boolean> {
    const url = `https://api.todoist.com/rest/v1/tasks/${id}/close`;

    debug(url);

    const result = await fetch(url, {
      headers: new Headers({
        Authorization: `Bearer ${this.token}`,
      }),
      method: "POST",
    });

    return result.ok;
  }

  async fetchMetadata(): Promise<void> {
    const [projects, sections, labels] = await Promise.all<
      IProjectRaw[],
      ISectionRaw[],
      ILabelRaw[]
    >([this.getProjects(), this.getSections(), this.getLabels()]);

    this.metadata.update((metadata) => {
      metadata.projects.clear();
      metadata.sections.clear();
      metadata.labels.clear();
      projects.forEach((prj) => metadata.projects.set(prj.id, prj));
      sections.forEach((sect) => metadata.sections.set(sect.id, sect));
      labels.forEach((label) => metadata.labels.set(label.id, label.name));
      return metadata;
    });
  }

  private async getProjects(): Promise<IProjectRaw[]> {
    const url = `https://api.todoist.com/rest/v1/projects`;

    const result = await fetch(url, {
      headers: new Headers({
        Authorization: `Bearer ${this.token}`,
      }),
      method: "GET",
    });

    return (await result.json()) as IProjectRaw[];
  }

  private async getSections(): Promise<ISectionRaw[]> {
    const url = `https://api.todoist.com/rest/v1/sections`;

    const result = await fetch(url, {
      headers: new Headers({
        Authorization: `Bearer ${this.token}`,
      }),
      method: "GET",
    });

    return (await result.json()) as ISectionRaw[];
  }

  private async getLabels(): Promise<ILabelRaw[]> {
    const url = `https://api.todoist.com/rest/v1/labels`;

    const result = await fetch(url, {
      headers: new Headers({
        Authorization: `Bearer ${this.token}`,
      }),
      method: "GET",
    });

    return (await result.json()) as ILabelRaw[];
  }
}
