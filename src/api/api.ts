import { writable } from "svelte/store";
import type { Writable } from "svelte/store";
import debug from "../log";
import type {
  ITaskRaw,
  IProjectRaw,
  ISectionRaw,
  ILabelRaw,
} from "./raw_models";
import { Task, Project } from "./models";
import type { ID, ProjectID, SectionID, LabelID } from "./models";
import { ExtendedMap } from "../utils";
import { Result } from "../result";
import { requestUrl } from "obsidian";

export interface ITodoistMetadata {
  projects: ExtendedMap<ProjectID, IProjectRaw>;
  sections: ExtendedMap<SectionID, ISectionRaw>;
  labels: ExtendedMap<LabelID, string>;
}

export interface ICreateTaskOptions {
  priority: number;
  project_id?: ProjectID;
  section_id?: SectionID;
  due_date?: string;
  labels?: string[];
}

export class TodoistApi {
  public metadata: Writable<ITodoistMetadata>;
  public metadataInstance: ITodoistMetadata;
  private token: string;

  constructor(token: string) {
    this.token = token;
    this.metadataInstance = {
      projects: new ExtendedMap<ProjectID, IProjectRaw>(),
      sections: new ExtendedMap<SectionID, ISectionRaw>(),
      labels: new ExtendedMap<LabelID, string>(),
    };

    this.metadata = writable(this.metadataInstance);
    this.metadata.subscribe((value) => (this.metadataInstance = value));
  }

  async createTask(
    content: string,
    options?: ICreateTaskOptions
  ): Promise<Result<object, Error>> {
    const url = "https://api.todoist.com/rest/v2/tasks";
    const data = { content: content, ...(options ?? {}) };

    try {
      const result = await requestUrl({
        url: url,
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (result.status == 200) {
        return Result.Ok({});
      } else {
        return Result.Err(new Error("Failed to create task"));
      }
    } catch (e) {
      return Result.Err(e);
    }
  }

  async getTasks(filter?: string): Promise<Result<Task[], Error>> {
    let url = "https://api.todoist.com/rest/v2/tasks";

    if (filter) {
      url += `?filter=${encodeURIComponent(filter)}`;
    }

    debug(url);

    try {
      const result = await requestUrl({
        url: url,
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (result.status == 200) {
        const tasks = result.json as ITaskRaw[];
        const tree = Task.buildTree(tasks);

        debug({
          msg: "Built task tree",
          context: tree,
        });

        return Result.Ok(tree);
      } else {
        return Result.Err(new Error(result.text));
      }
    } catch (e) {
      return Result.Err(e);
    }
  }

  async getTasksGroupedByProject(
    filter?: string
  ): Promise<Result<Project[], Error>> {
    let url = "https://api.todoist.com/rest/v2/tasks";

    if (filter) {
      url += `?filter=${encodeURIComponent(filter)}`;
    }

    try {
      const result = await requestUrl({
        url: url,
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (result.status == 200) {
        // Force the metadata to update.
        const metadataResult = await this.fetchMetadata();

        if (metadataResult.isErr()) {
          return Result.Err(metadataResult.unwrapErr());
        }

        const tasks = result.json as ITaskRaw[];
        const tree = Project.buildProjectTree(tasks, this.metadataInstance);

        debug({
          msg: "Built project tree",
          context: tree,
        });

        return Result.Ok(tree);
      } else {
        return Result.Err(new Error(result.text));
      }
    } catch (e) {
      return Result.Err(e);
    }
  }

  async closeTask(id: ID): Promise<boolean> {
    const url = `https://api.todoist.com/rest/v2/tasks/${id}/close`;

    debug(url);

    const result = await requestUrl({
      url: url,
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      method: "POST",
    });

    return result.status == 204;
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
    const url = `https://api.todoist.com/rest/v2/projects`;

    try {
      const result = await requestUrl({
        url: url,
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        method: "GET",
      });

      return result.status == 200
        ? Result.Ok(result.json as IProjectRaw[])
        : Result.Err(new Error(result.text));
    } catch (e) {
      return Result.Err(e);
    }
  }

  private async getSections(): Promise<Result<ISectionRaw[], Error>> {
    const url = `https://api.todoist.com/rest/v2/sections`;
    try {
      const result = await requestUrl({
        url: url,
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        method: "GET",
      });

      return result.status == 200
        ? Result.Ok(result.json as ISectionRaw[])
        : Result.Err(new Error(result.text));
    } catch (e) {
      return Result.Err(e);
    }
  }

  private async getLabels(): Promise<Result<ILabelRaw[], Error>> {
    const url = `https://api.todoist.com/rest/v2/labels`;
    try {
      const result = await requestUrl({
        url: url,
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        method: "GET",
      });

      return result.status == 200
        ? Result.Ok(result.json as ILabelRaw[])
        : Result.Err(new Error(result.text));
    } catch (e) {
      return Result.Err(e);
    }
  }
}
