import type { ProjectId } from "@/api/domain/project";

export type SectionId = string;

export type Section = {
  id: SectionId;
  projectId: ProjectId;
  name: string;
  sectionOrder: number;
  isDeleted: boolean;
  isArchived: boolean;
};
