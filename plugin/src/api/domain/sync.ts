import type { Label } from "@/api/domain/label";
import type { Project } from "@/api/domain/project";
import type { Section } from "@/api/domain/section";

export type SyncResponse = {
  syncToken: SyncToken;
  labels: Label[];
  projects: Project[];
  sections: Section[];
};

export type SyncToken = string;
