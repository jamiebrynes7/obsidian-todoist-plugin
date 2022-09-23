import type { ID, ProjectID, SectionID, LabelID } from "./models";

export const UnknownProject: IProjectRaw = {
  id: "-1",
  parent_id: null,
  order: -1,
  name: "Unknown project",
};

export const UnknownSection: ISectionRaw = {
  id: "-1",
  project_id: "-1",
  order: -1,
  name: "Unknown section",
};

export interface ITaskRaw {
  id: ID;
  project_id: ProjectID;
  section_id: SectionID | null;
  /**
   * The task has direct reference to the label names, and does not reference the label objects.
   *
   * That is, if you have a label {id:"123abc", name:"errand"} in the labels dataset, a task with
   * that label will have the attribute { label: ["errand"] }.
   */
  labels: string[];
  priority: number;
  content: string;
  order: number;
  parent_id?: ID | null;
  due?: {
    recurring: boolean;
    date: string | null;
    datetime?: string | null;
  };
}

export interface IProjectRaw {
  id: ProjectID;
  parent_id?: ProjectID | null;
  order: number;
  name: string;
}

export interface ISectionRaw {
  id: SectionID;
  project_id: ProjectID;
  order: number;
  name: string;
}

export interface ILabelRaw {
  id: LabelID;
  name: string;
}
