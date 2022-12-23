<script lang="ts">
  import Select from "svelte-select";
  import type { ITodoistMetadata } from "../../api/api";
  import type { ProjectID, SectionID } from "../../api/models";
  import type { ProjectOption } from "./types";
  import debug from "../../log";

  export let selected: ProjectOption;
  export let metadata: ITodoistMetadata;

  $: projectTree = createProjectTree(metadata);

  function createProjectTree(metadata: ITodoistMetadata): ProjectOption[] {
    const projects = new Map<
      ProjectID,
      { subProjects: ProjectID[]; sections: SectionID[] }
    >();

    for (const project of metadata.projects.values()) {
      if (!projects.has(project.id)) {
        projects.set(project.id, { subProjects: [], sections: [] });
      }

      if (project.parent_id) {
        if (projects.has(project.parent_id)) {
          const data = projects.get(project.parent_id);
          data.subProjects.push(project.id);
        } else {
          projects.set(project.parent_id, {
            subProjects: [project.id],
            sections: [],
          });
        }
      }
    }

    for (const section of metadata.sections.values()) {
      const data = projects.get(section.project_id);
      if (data === undefined) {
        debug(`Could not find data for project ${section.project_id}`);
        continue;
      }
      data.sections.push(section.id);
    }

    // Now generate the value/label combos
    const topLevelProjects = Array.from(metadata.projects.values())
      .filter((prj) => prj.parent_id == null)
      .sort((prj1, prj2) => prj1.order - prj2.order);

    const options = [];

    function descendPrjTree(id: ProjectID, depth: number, chain: string) {
      let prjName = metadata.projects.get(id).name;
      let nextChain = chain + prjName + " > ";
      options.push({
        value: {
          type: "Project",
          id: id,
        },
        label: chain + " " + prjName,
      });

      let children = projects.get(id);

      if (children?.sections) {
        for (const sectionId of children.sections) {
          let section = metadata.sections.get(sectionId);
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
