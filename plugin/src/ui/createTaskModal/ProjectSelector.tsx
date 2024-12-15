import { t } from "@/i18n";
import { PluginContext } from "@/ui/context";
import { Platform } from "obsidian";
import type React from "react";
import { useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogTrigger,
  Input,
  type Key,
  ListBox,
  ListBoxItem,
  SearchField,
} from "react-aria-components";
import type TodoistPlugin from "../..";
import type { Project, ProjectId } from "../../api/domain/project";
import type { Section, SectionId } from "../../api/domain/section";
import { ObsidianIcon } from "../components/obsidian-icon";
import { Popover } from "./Popover";

export type ProjectIdentifier = {
  projectId: ProjectId;
  sectionId?: SectionId;
};

type Props = {
  selected: ProjectIdentifier;
  setSelected: (selected: ProjectIdentifier) => void;
};

export const ProjectSelector: React.FC<Props> = ({ selected, setSelected }) => {
  const plugin = PluginContext.use();
  const todoistData = plugin.services.todoist.data();

  const [filter, setFilter] = useState("");
  const hierarchy = useMemo(() => buildProjectHierarchy(plugin), [plugin]);

  const onSelect = (key: Key) => {
    if (typeof key === "number") {
      throw Error("Unexpected key type: number");
    }

    const [id, isSection] = ItemKey.parse(key);

    if (isSection) {
      const section = todoistData.sections.byId(id);
      if (section === undefined) {
        throw Error("Could not find selected section");
      }

      setSelected({
        projectId: section.projectId,
        sectionId: section.id,
      });
      return;
    }

    setSelected({ projectId: id });
  };

  const i18n = t().createTaskModal.projectSelector;

  return (
    <DialogTrigger>
      <Button className="project-selector" aria-label={i18n.buttonLabel}>
        <ButtonLabel {...selected} />
        <ObsidianIcon size="s" id="chevron-down" />
      </Button>
      <Popover>
        <Dialog className="task-option-dialog task-project-menu" aria-label={i18n.selectorLabel}>
          {({ close }) => (
            <>
              {!Platform.isMobile && (
                <>
                  <SearchFilter filter={filter} setFilter={setFilter} />
                  <hr />
                </>
              )}
              <ListBox
                aria-label={i18n.optionsLabel}
                selectionMode="single"
                onAction={(key) => {
                  onSelect(key);
                  close();
                }}
              >
                {hierarchy.map((nested) => (
                  <NestedProjectItem
                    key={nested.project.id}
                    nested={nested}
                    depth={0}
                    filter={filter}
                  />
                ))}
              </ListBox>
            </>
          )}
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
};

type SearchFilterProps = {
  filter: string;
  setFilter: (filter: string) => void;
};

const SearchFilter: React.FC<SearchFilterProps> = ({ filter, setFilter }) => {
  const onChange = (changeEv: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(changeEv.target.value.toLowerCase());
  };

  const i18n = t().createTaskModal.projectSelector.search;

  return (
    <SearchField aria-label={i18n.label} className="search-filter-container">
      <Input value={filter} onChange={onChange} placeholder={i18n.placeholder} autoFocus={true} />
    </SearchField>
  );
};

type NestedProjectItemProps = {
  nested: NestedProject;
  depth: number;
  filter: string;
};

const NestedProjectItem: React.FC<NestedProjectItemProps> = ({ nested, depth, filter }) => {
  return (
    <>
      <ProjectOption project={nested.project} depth={depth} filter={filter} />
      {nested.sections.map((section) => (
        <SectionOption key={section.id} section={section} depth={depth} filter={filter} />
      ))}
      {nested.children.map((nested) => (
        <NestedProjectItem
          key={nested.project.id}
          nested={nested}
          depth={depth + 1}
          filter={filter}
        />
      ))}
    </>
  );
};

type ProjectOptionProps = {
  project: Project;
  depth: number;
  filter: string;
};

const ProjectOption: React.FC<ProjectOptionProps> = ({ project, depth, filter }) => {
  const key = ItemKey.make(project.id);

  // If there is a filter, we don't want to show the hierarchy
  const actualDepth = filter === "" ? depth : 0;
  const isFilteredOut = filter !== "" && !project.name.toLowerCase().contains(filter);

  return (
    <ListBoxItem
      id={key}
      key={key}
      className="project-option"
      data-depth={actualDepth}
      data-filtered={isFilteredOut}
      textValue={project.name}
    >
      <ProjectLabel project={project} />
    </ListBoxItem>
  );
};

type SectionOptionProps = {
  section: Section;
  depth: number;
  filter: string;
};

const SectionOption: React.FC<SectionOptionProps> = ({ section, depth, filter }) => {
  const key = ItemKey.make(section.id, true);

  // If there is a filter, we don't want to show the hierarchy
  const actualDepth = filter === "" ? depth + 1 : 0;
  const isFilteredOut = filter !== "" && !section.name.toLowerCase().contains(filter);

  return (
    <ListBoxItem
      id={key}
      key={key}
      className="project-option"
      data-depth={actualDepth}
      data-filtered={isFilteredOut}
      textValue={section.name}
    >
      <SectionLabel section={section} />
    </ListBoxItem>
  );
};

const ItemKey = {
  make: (id: string, isSection = false): string => {
    const prefix = isSection ? "section" : "project";
    return `${prefix} : ${id}`;
  },
  parse: (key: string): [string, boolean] => {
    const isSection = key.startsWith("section");
    const id = key.split(" : ")[1];

    return [id, isSection];
  },
};

const SectionLabel: React.FC<{ section: Section }> = ({ section }) => {
  return (
    <>
      <ObsidianIcon size="s" id="gallery-vertical" />
      <div>{section.name}</div>
    </>
  );
};

const ProjectLabel: React.FC<{ project: Project }> = ({ project }) => {
  const projectIcon = project.isInboxProject ? "inbox" : "hash";

  return (
    <>
      <ObsidianIcon size="s" id={projectIcon} />
      <div>{project.name}</div>
    </>
  );
};

const ButtonLabel: React.FC<ProjectIdentifier> = ({ projectId, sectionId }) => {
  const { projects, sections } = PluginContext.use().services.todoist.data();

  const selectedProject = projects.byId(projectId);
  if (selectedProject === undefined) {
    throw Error("Could not find selected project");
  }

  const selectedSection = sectionId !== undefined ? sections.byId(sectionId) : undefined;

  return (
    <>
      <ProjectLabel project={selectedProject} />
      {selectedSection && (
        <>
          <div>/</div>
          <SectionLabel section={selectedSection} />
        </>
      )}
    </>
  );
};

type NestedProject = {
  project: Project;
  sections: Section[];
  children: NestedProject[];
};

type ProjectHeirarchy = NestedProject[];

function buildProjectHierarchy(plugin: TodoistPlugin): ProjectHeirarchy {
  const data = plugin.services.todoist.data();
  const mapped = new Map<ProjectId, NestedProject>();

  // Go through each project and insert it into the map.
  for (const project of data.projects.iter()) {
    mapped.set(project.id, { project, sections: [], children: [] });
  }

  // Now parent them together.
  for (const project of data.projects.iter()) {
    if (project.parentId === null) {
      continue;
    }

    const child = mapped.get(project.id);
    const parent = mapped.get(project.parentId);

    if (child === undefined) {
      throw Error("Failed to find project in map");
    }

    // In this scenario, we could be in a weird half-way sync state.
    if (parent === undefined) {
      continue;
    }

    parent.children.push(child);
  }

  // Now attach sections
  for (const section of data.sections.iter()) {
    const parent = mapped.get(section.projectId);

    // We could be in a weird half-way sync state, so ignore this.
    if (parent === undefined) {
      continue;
    }

    parent.sections.push(section);
  }

  // Sort each element in the map
  for (const [_, nested] of mapped) {
    nested.sections.sort((a, b) => a.order - b.order);
    nested.children.sort((a, b) => a.project.order - b.project.order);
  }

  // Find top-level projects, i.e. - have no parents
  const roots = Array.from(data.projects.iter())
    .filter((project) => project.parentId === null)
    .map((project) => {
      const nested = mapped.get(project.id);
      if (nested === undefined) {
        throw Error("Failed to find root project in map");
      }

      return nested;
    });

  // Sort roots, forcing the inbox to be first.
  roots.sort((a, b) => {
    if (a.project.isInboxProject) {
      return -1;
    }

    if (b.project.isInboxProject) {
      return 1;
    }

    return a.project.order - b.project.order;
  });

  return roots;
}
