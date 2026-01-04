import type React from "react";
import { useMemo, useState } from "react";

import { t } from "@/i18n";
import type { ProjectDefaultSetting } from "@/settings";
import { ObsidianIcon } from "@/ui/components/obsidian-icon";
import { PluginContext } from "@/ui/context";

type Props = {
  value: ProjectDefaultSetting;
  onChange: (val: ProjectDefaultSetting) => Promise<void>;
};

export const ProjectDropdownControl: React.FC<Props> = ({ value, onChange }) => {
  const [selected, setSelected] = useState(value);
  const plugin = PluginContext.use();
  const todoist = plugin.services.todoist;
  const i18n = t().settings.taskCreation.defaultProject;

  const projects = useMemo(() => {
    if (!todoist.isReady()) {
      return [];
    }

    const allProjects = Array.from(todoist.data().projects.iterActive());
    return allProjects
      .filter((project) => !project.inboxProject)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [todoist]);

  const selectedProject =
    selected !== null ? projects.find((p) => p.id === selected.projectId) : null;
  const isProjectDeleted = selected !== null && !selectedProject;

  const handleChange = async (ev: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = ev.target.value;

    let newValue: ProjectDefaultSetting;
    if (selectedValue === "") {
      newValue = null;
    } else {
      const project = projects.find((p) => p.id === selectedValue);
      if (project === undefined) {
        return;
      }

      newValue = {
        projectId: project.id,
        projectName: project.name,
      };
    }

    setSelected(newValue);
    await onChange(newValue);
  };

  return (
    <div className="project-dropdown-container">
      {isProjectDeleted && (
        <div className="project-dropdown-warning-icon" title={i18n.deletedWarning}>
          <ObsidianIcon size="s" id="lucide-alert-triangle" />
        </div>
      )}
      <select className="dropdown" value={selected?.projectId ?? ""} onChange={handleChange}>
        <option value="">{i18n.noDefault}</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
        {isProjectDeleted && selected && (
          <option value={selected.projectId} disabled>
            {selected.projectName} ({i18n.deleted})
          </option>
        )}
      </select>
    </div>
  );
};
