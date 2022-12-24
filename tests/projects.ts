import "mocha";
import { assert } from "chai";
import type { LabelID, ProjectID, SectionID } from "../src/api/models";
import { Project } from "../src/api/models";
import type { ITaskRaw, IProjectRaw, ISectionRaw } from "../src/api/raw_models";
import type { ITodoistMetadata } from "../src/api/api";
import { ExtendedMap } from "../src/utils";

describe("Project tree parsing", () => {
  it("Projects are parented correctly", () => {
    const rawTasks: ITaskRaw[] = [
      {
        id: "1",
        project_id: "1",
        section_id: null,
        labels: [],
        content: "",
        priority: 1,
        order: 1,
      },
      {
        id: "2",
        project_id: "2",
        section_id: null,
        labels: [],
        content: "",
        priority: 1,
        order: 2,
      },
    ];

    const metadata = createMetadata({
      projects: [
        {
          id: "1",
          order: 1,
          name: "Parent",
        },
        {
          id: "2",
          order: 2,
          parent_id: "1",
          name: "Child",
        },
      ],
    });

    const projectTree = Project.buildProjectTree(rawTasks, metadata);
    assert.lengthOf(projectTree, 1, "Resulting tree has one parent node");

    const parent = projectTree[0];
    assert.lengthOf(
      parent.subProjects,
      1,
      "Parent project has one sub-project"
    );

    assert.equal(parent.projectID, "1");
    assert.lengthOf(parent.tasks, 1, "Parent has one task");
    assert.equal(parent.tasks[0].id, "1", "Parent has correct task");

    const child = parent.subProjects[0];
    assert.equal(child.projectID, "2");
    assert.lengthOf(child.tasks, 1, "Child has one task");
    assert.equal(child.tasks[0].id, "2", "Child has correct task");
  });

  it("Sections are parented correctly", () => {
    const rawTask: ITaskRaw[] = [
      {
        id: "1",
        project_id: "1",
        section_id: "1",
        labels: [],
        content: "",
        priority: 1,
        order: 1,
      },
    ];

    const metadata = createMetadata({
      projects: [
        {
          id: "1",
          order: 1,
          name: "Parent",
        },
      ],
      sections: [
        {
          id: "1",
          project_id: "1",
          order: 0,
          name: "Section",
        },
      ],
    });

    const projects = Project.buildProjectTree(rawTask, metadata);
    assert.lengthOf(projects, 1, "Resulting tree has one parent node.");

    const parent = projects[0];
    assert.lengthOf(parent.sections, 1, "Parent has one section");
    assert.lengthOf(parent.tasks, 0, "Parent has no tasks");

    const section = parent.sections[0];
    assert.equal(section.sectionID, "1");
    assert.lengthOf(section.tasks, 1, "Section has one task");
  });

  it("Unknown project or sections are marked as such", () => {
    const tasks: ITaskRaw[] = [
      {
        id: "1",
        project_id: "1",
        section_id: null,
        labels: [],
        content: "",
        priority: 1,
        order: 1,
      },
      {
        id: "2",
        project_id: "2",
        section_id: "1",
        labels: [],
        content: "",
        priority: 1,
        order: 2,
      },
    ];

    const projects = Project.buildProjectTree(tasks, createMetadata({}));
    assert.lengthOf(projects, 1, "Only one project is returned");

    const parent = projects[0];
    assert.equal(parent.projectID, "-1", "Unknown project ID");
    assert.lengthOf(parent.tasks, 1, "Parent has one task");
    assert.equal(parent.tasks[0].id, "1", "Parent has 'correct' task");

    assert.lengthOf(parent.sections, 1, "Parent has one section");
    const section = parent.sections[0];
    assert.equal(section.sectionID, "-1", "Unknown section ID");
    assert.lengthOf(section.tasks, 1, "Parent has one task");
    assert.equal(section.tasks[0].id, "2", "Parent has 'correct' task");
  });
});

function createMetadata(options: {
  projects?: IProjectRaw[];
  sections?: ISectionRaw[];
}): ITodoistMetadata {
  const metadata: ITodoistMetadata = {
    projects: new ExtendedMap<ProjectID, IProjectRaw>(),
    sections: new ExtendedMap<SectionID, ISectionRaw>(),
    labels: new ExtendedMap<LabelID, string>(),
  };

  if (options.projects) {
    options.projects.forEach((prj) => metadata.projects.set(prj.id, prj));
  }

  if (options.sections) {
    options.sections.forEach((sect) => metadata.sections.set(sect.id, sect));
  }

  return metadata;
}
