import type { ProjectId } from "./project";

export type SectionId = string;

export type Section = {
  id: SectionId,
  projectId: ProjectId,
  name: string,
  order: number,
}