import classNames from "classnames";
import type React from "react";
import { useMemo, useState } from "react";

import type { Label } from "@/api/domain/label";
import { t } from "@/i18n";
import type { LabelsDefaultSetting } from "@/settings";
import { ObsidianIcon } from "@/ui/components/obsidian-icon";
import { PluginContext } from "@/ui/context";

type Props = {
  value: LabelsDefaultSetting;
  onChange: (val: LabelsDefaultSetting) => Promise<void>;
};

export const LabelsControl: React.FC<Props> = ({ value, onChange }) => {
  const [selected, setSelected] = useState(value);
  const plugin = PluginContext.use();
  const todoist = plugin.services.todoist;
  const i18n = t().settings.taskCreation.defaultLabels;

  const labelsById: Map<string, Label> = useMemo(() => {
    if (!todoist.isReady()) {
      return new Map();
    }
    return new Map(Array.from(todoist.data().labels.iter()).map((label) => [label.id, label]));
  }, [todoist]);

  const availableLabels = useMemo(() => {
    const selectedIds = selected.map((l) => l.labelId);
    return Array.from(labelsById.values()).filter((label) => !selectedIds.includes(label.id));
  }, [labelsById, selected]);

  const removeLabel = async (labelId: string) => {
    const newValue = selected.filter((l) => l.labelId !== labelId);
    setSelected(newValue);
    await onChange(newValue);
  };

  const handleAddLabelChange = async (ev: React.ChangeEvent<HTMLSelectElement>) => {
    ev.stopPropagation();
    ev.preventDefault();

    const labelId = ev.target.value;
    if (labelId === "") {
      return;
    }

    const label = labelsById.get(labelId);
    if (label === undefined) {
      return;
    }

    const newValue = [...selected, { labelId: label.id, labelName: label.name }];
    setSelected(newValue);
    await onChange(newValue);
  };

  return (
    <div className="labels-control-container">
      <select
        className="dropdown"
        value=""
        onChange={handleAddLabelChange}
        disabled={availableLabels.length === 0}
      >
        <option value="" disabled>
          {availableLabels.length === 0 ? i18n.buttonNoAvailableLabels : i18n.buttonAddLabel}
        </option>
        {availableLabels.map((label) => (
          <option key={label.id} value={label.id}>
            {label.name}
          </option>
        ))}
      </select>

      <div className="labels-control-list">
        {selected.length === 0 && <div className="labels-control-empty-state">{i18n.noLabels}</div>}
        {selected.map((labelSetting) => {
          const label = labelsById.get(labelSetting.labelId);
          const isDeleted = label === undefined;

          return (
            <div
              key={labelSetting.labelId}
              className={classNames("labels-control-item", { "is-deleted": isDeleted })}
            >
              <div className="labels-control-item-details">
                <ObsidianIcon
                  size="xs"
                  id="lucide-alert-triangle"
                  className="label-deleted-warning-icon"
                  aria-label={i18n.deletedWarning}
                />
                <ObsidianIcon
                  size="xs"
                  id="tag"
                  className="label-icon"
                  data-label-color={label?.color}
                />
                <span className="labels-control-item-name">
                  {labelSetting.labelName}
                  {isDeleted && ` (${i18n.deleted})`}
                </span>
              </div>
              <button
                type="button"
                className="labels-control-remove-button clickable-icon"
                onClick={() => removeLabel(labelSetting.labelId)}
              >
                <ObsidianIcon size="xs" id="cross" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
