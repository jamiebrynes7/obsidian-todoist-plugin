import type { Label, LabelId } from "@/api/domain/label";
import type { Project, ProjectId } from "@/api/domain/project";
import type { Section, SectionId } from "@/api/domain/section";
import type { Task as ApiTask } from "@/api/domain/task";
import type { RepositoryReader } from "@/data/repository";
import type { Task } from "@/data/task";

export type DataAccessor = {
  projects: RepositoryReader<ProjectId, Project>;
  sections: RepositoryReader<SectionId, Section>;
  labels: RepositoryReader<LabelId, Label>;
};

export function hydrate(apiTask: ApiTask, data: DataAccessor): Task {
  const project = data.projects.byId(apiTask.projectId);
  const section = apiTask.sectionId
    ? (data.sections.byId(apiTask.sectionId) ?? makeUnknownSection(apiTask.sectionId))
    : undefined;

  const labels = apiTask.labels.map((id) => data.labels.byName(id) ?? makeUnknownLabel());

  return {
    id: apiTask.id,
    createdAt: apiTask.addedAt,

    content: apiTask.content,
    description: apiTask.description,

    project: project ?? makeUnknownProject(apiTask.projectId),
    section,
    parentId: apiTask.parentId ?? undefined,

    labels,
    priority: apiTask.priority,

    due: apiTask.due ?? undefined,
    duration: apiTask.duration ?? undefined,
    deadline: apiTask.deadline ?? undefined,
    order: apiTask.childOrder,
  };
}

const makeUnknownProject = (id: string): Project => {
  return {
    id,
    parentId: null,
    name: "Unknown Project",
    childOrder: Number.MAX_SAFE_INTEGER,
    inboxProject: false,
    color: "grey",
    isDeleted: false,
    isArchived: false,
  };
};

const makeUnknownSection = (id: string): Section => {
  return {
    id,
    projectId: "unknown-project",
    name: "Unknown Section",
    sectionOrder: Number.MAX_SAFE_INTEGER,
    isDeleted: false,
    isArchived: false,
  };
};

const makeUnknownLabel = (): Label => {
  return {
    id: "unknown-label",
    name: "Unknown Label",
    color: "grey",
    isDeleted: false,
  };
};
