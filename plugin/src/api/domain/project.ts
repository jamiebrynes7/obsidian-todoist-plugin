export type ProjectId = string;

export type Project = {
  id: ProjectId;
  parentId: ProjectId | null;
  name: string;
  childOrder: number;
  inboxProject: boolean;
  color: string;
  isDeleted: boolean;
  isArchived: boolean;
};
