export type ProjectId = string;

export type Project = {
  id: ProjectId;
  parentId: ProjectId | null;
  name: string;
  order: number;
  isInboxProject: boolean;
  color: string;
};
