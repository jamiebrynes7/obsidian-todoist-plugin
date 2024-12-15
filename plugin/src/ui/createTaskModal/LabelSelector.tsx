import { t } from "@/i18n";
import { PluginContext } from "@/ui/context";
import type React from "react";
import { useMemo } from "react";
import { Button, DialogTrigger, ListBox, ListBoxItem, type Selection } from "react-aria-components";
import type { Label } from "../../api/domain/label";
import { ObsidianIcon } from "../components/obsidian-icon";
import { Popover } from "./Popover";

type Props = {
  selected: Label[];
  setSelected: (labels: Label[]) => void;
};

export const LabelSelector: React.FC<Props> = ({ selected, setSelected }) => {
  const plugin = PluginContext.use();

  const options = useMemo(() => {
    return Array.from(plugin.services.todoist.data().labels.iter());
  }, [plugin]);

  const selectedKeys = selected.map((l) => l.id);

  const onSelectionChange = (selection: Selection) => {
    if (selection === "all") {
      setSelected([...options]);
      return;
    }

    setSelected(options.filter((l) => selection.has(l.id)));
  };

  const i18n = t().createTaskModal.labelSelector;

  return (
    <DialogTrigger>
      <Button className="label-selector" aria-label={i18n.buttonLabel}>
        <ObsidianIcon size="m" id="tag" />
        {i18n.buttonText(selected.length)}
      </Button>
      <Popover>
        <ListBox
          aria-label={i18n.labelOptionsLabel}
          selectionMode="multiple"
          className="task-option-dialog task-label-menu"
          selectedKeys={selectedKeys}
          onSelectionChange={onSelectionChange}
        >
          {options.map((l) => (
            <LabelItem key={l.id} label={l} isSelected={selectedKeys.contains(l.id)} />
          ))}
        </ListBox>
      </Popover>
    </DialogTrigger>
  );
};

type LabelItemProps = {
  label: Label;
  isSelected: boolean;
};

const LabelItem: React.FC<LabelItemProps> = ({ label, isSelected }) => {
  return (
    <ListBoxItem
      id={label.id}
      key={label.id}
      className="label-option"
      aria-label={label.name}
      textValue={label.name}
    >
      {label.name}
      {isSelected && <ObsidianIcon size="xs" id="check" />}
    </ListBoxItem>
  );
};
