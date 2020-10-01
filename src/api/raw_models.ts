import type { ID, ProjectID, SectionID, LabelID } from "./models";

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

export interface ITaskRaw {
  id: ID;
  project_id: ProjectID;
  section_id: SectionID;
  label_ids: LabelID[];
  priority: number;
  content: string;
  order: number;
  parent?: ID;
  due?: {
    recurring: boolean;
    date: string;
    datetime?: string;
  };
}

export interface IProjectRaw {
  id: ProjectID;
  parent_id?: ProjectID;
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
