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
import { Result } from "../result";

export interface ITodoistMetadata {
  projects: ExtendedMap<ProjectID, IProjectRaw>;
  sections: ExtendedMap<SectionID, ISectionRaw>;
  labels: ExtendedMap<LabelID, string>;
}

export interface ICreateTaskOptions {
  priority: number;
  project_id?: number;
  section_id?: number;
  due_date?: string;
  label_ids?: number[];
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

  async createTask(
    content: string,
    options?: ICreateTaskOptions
  ): Promise<Result<object, Error>> {
    const url = "https://api.todoist.com/rest/v1/tasks";
    const data = { content: content, ...(options ?? {}) };

    try {
      const result = await fetch(url, {
        method: "POST",
        headers: new Headers({
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(data),
      });

      if (result.ok) {
        return Result.Ok({});
      } else {
        return Result.Err(new Error("Failed to create task"));
      }
    } catch (e) {
      return Result.Err(e);
    }
  }

  async getTasks(filter?: string): Promise<Result<Task[], Error>> {
    let url = "https://api.todoist.com/rest/v1/tasks";

    if (filter) {
      url += `?filter=${encodeURIComponent(filter)}`;
    }

    debug(url);

    try {
      const result = await fetch(url, {
        headers: new Headers({
          Authorization: `Bearer ${this.token}`,
        }),
      });

      if (result.ok) {
        const tasks = (await result.json()) as ITaskRaw[];
        const tree = Task.buildTree(tasks);

        debug({
          msg: "Built task tree",
          context: tree,
        });

        return Result.Ok(tree);
      } else {
        return Result.Err(new Error(await result.text()));
      }
    } catch (e) {
      return Result.Err(e);
    }
  }

  async getTasksGroupedByProject(
    filter?: string
  ): Promise<Result<Project[], Error>> {
    let url = "https://api.todoist.com/rest/v1/tasks";

    if (filter) {
      url += `?filter=${encodeURIComponent(filter)}`;
    }

    try {
      const result = await fetch(url, {
        headers: new Headers({
          Authorization: `Bearer ${this.token}`,
        }),
      });

      if (result.ok) {
        // Force the metadata to update.
        const metadataResult = await this.fetchMetadata();

        if (metadataResult.isErr()) {
          return Result.Err(metadataResult.unwrapErr());
        }

        const tasks = (await result.json()) as ITaskRaw[];
        const tree = Project.buildProjectTree(tasks, this.metadataInstance);

        debug({
          msg: "Built project tree",
          context: tree,
        });

        return Result.Ok(tree);
      } else {
        return Result.Err(new Error(await result.text()));
      }
    } catch (e) {
      return Result.Err(e);
    }
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

  async fetchMetadata(): Promise<Result<object, Error>> {
    const projectResult = await this.getProjects();
    const sectionResult = await this.getSections();
    const labelResult = await this.getLabels();

    const merged = Result.All(projectResult, sectionResult, labelResult);

    if (merged.isErr()) {
      return merged.intoErr();
    }

    const [projects, sections, labels] = merged.unwrap();

    this.metadata.update((metadata) => {
      metadata.projects.clear();
      metadata.sections.clear();
      metadata.labels.clear();
      projects.forEach((prj) => metadata.projects.set(prj.id, prj));
      sections.forEach((sect) => metadata.sections.set(sect.id, sect));
      labels.forEach((label) => metadata.labels.set(label.id, label.name));
      return metadata;
    });

    return Result.Ok({});
  }

  private async getProjects(): Promise<Result<IProjectRaw[], Error>> {
    const url = `https://api.todoist.com/rest/v1/projects`;

    try {
      const result = await fetch(url, {
        headers: new Headers({
          Authorization: `Bearer ${this.token}`,
        }),
        method: "GET",
      });

      return result.ok
        ? Result.Ok((await result.json()) as IProjectRaw[])
        : Result.Err(new Error(await result.text()));
    } catch (e) {
      return Result.Err(e);
    }
  }

  private async getSections(): Promise<Result<ISectionRaw[], Error>> {
    const url = `https://api.todoist.com/rest/v1/sections`;
    try {
      const result = await fetch(url, {
        headers: new Headers({
          Authorization: `Bearer ${this.token}`,
        }),
        method: "GET",
      });

      return result.ok
        ? Result.Ok((await result.json()) as ISectionRaw[])
        : Result.Err(new Error(await result.text()));
    } catch (e) {
      return Result.Err(e);
    }
  }

  private async getLabels(): Promise<Result<ILabelRaw[], Error>> {
    const url = `https://api.todoist.com/rest/v1/labels`;
    try {
      const result = await fetch(url, {
        headers: new Headers({
          Authorization: `Bearer ${this.token}`,
        }),
        method: "GET",
      });

      return result.ok
        ? Result.Ok((await result.json()) as ILabelRaw[])
        : Result.Err(new Error(await result.text()));
    } catch (e) {
      return Result.Err(e);
    }
  }
}
