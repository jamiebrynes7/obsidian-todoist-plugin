<script lang="ts">
  import Select from "svelte-select";
  import type { ProjectOption } from "./types";
  import debug from "../../log";
  import type { ProjectId } from "../../api/domain/project";
  import type { SectionId } from "../../api/domain/section";
  import type { TodoistAdapter } from "../../data";

  export let selected: ProjectOption | undefined;
  export let todoistAdapter: TodoistAdapter;

  $: projectTree = createProjectTree();

  function createProjectTree(): ProjectOption[] {
    const projectRelationships = new Map<
      ProjectId,
      { subProjects: ProjectId[]; sections: SectionId[] }
    >();

    for (const project of todoistAdapter.data().projects.iter()) {
      if (!projectRelationships.has(project.id)) {
        projectRelationships.set(project.id, { subProjects: [], sections: [] });
      }

      if (project.parentId) {
        if (projectRelationships.has(project.parentId)) {
          const data = projectRelationships.get(project.parentId);
          data?.subProjects.push(project.id);
        } else {
          projectRelationships.set(project.parentId, {
            subProjects: [project.id],
            sections: [],
          });
        }
      }
    }

    for (const section of todoistAdapter.data().sections.iter()) {
      const data = projectRelationships.get(section.projectId);
      if (data === undefined) {
        debug(`Could not find data for project ${section.projectId}`);
        continue;
      }
      data.sections.push(section.id);
    }

    // Now generate the value/label combos
    const topLevelProjects = Array.from(todoistAdapter.data().projects.iter())
      .filter((p) => p.parentId === null)
      .sort((first, second) => first.order - second.order);

    const options: any[] = [];

    function descendPrjTree(id: ProjectId, depth: number, chain: string) {
      const project = todoistAdapter.data().projects.byId(id);
      if (project === undefined) {
        console.error("Failed to find project");
        return;
      }
      let prjName = project.name;
      let nextChain = chain + prjName + " > ";
      options.push({
        value: {
          type: "Project",
          id: id,
        },
        label: chain + " " + prjName,
      });

      let children = projectRelationships.get(id);

      if (children?.sections) {
        for (const sectionId of children.sections) {
          const section = todoistAdapter.data().sections.byId(sectionId);
          if (section === undefined) {
            continue;
          }

          options.push({
            value: {
              type: "Section",
              id: section.id,
            },
            label: nextChain + section.name,
          });
        }
      }

      if (children?.subProjects) {
        for (const childProject of children.subProjects) {
          descendPrjTree(childProject, depth + 1, nextChain);
        }
      }
    }

    for (const prj of topLevelProjects) {
      descendPrjTree(prj.id, 0, "");
    }

    if (selected == null) {
      selected = options.find(
        (opt) => opt.label == " Inbox" && opt.value.type == "Project"
      );
    }

    return options;
  }
</script>

<Select
  items={projectTree}
  clearable={false}
  bind:value={selected}
  placeholder="Select project or section"
/>
