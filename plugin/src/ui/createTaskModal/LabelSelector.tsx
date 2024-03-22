import classNames from "classnames";
import React, { useMemo } from "react";
import {
  Button,
  DialogTrigger,
  ListBox,
  ListBoxItem,
  Popover,
  type Selection,
} from "react-aria-components";
import type { Label } from "../../api/domain/label";
import { ObsidianIcon } from "../components/obsidian-icon";
import { useModalContext } from "../context/modal";
import { usePluginContext } from "../context/plugin";

type Props = {
  selected: Label[];
  setSelected: (labels: Label[]) => void;
};

export const LabelSelector: React.FC<Props> = ({ selected, setSelected }) => {
  const modal = useModalContext();
  const plugin = usePluginContext();

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

  return (
    <DialogTrigger>
      <Button className="label-selector" aria-label="Set labels">
        <ObsidianIcon size={16} id="tag" />
        Labels ({selected.length})
      </Button>
      <Popover
        placement="bottom left"
        offset={5}
        UNSTABLE_portalContainer={modal.popoverContainerEl}
        className="modal-popover"
      >
        <ListBox
          aria-label="Label options"
          selectionMode="multiple"
          className="task-option-dialog task-label-menu"
          selectedKeys={selectedKeys}
          onSelectionChange={onSelectionChange}
        >
          {options.map((l) => (
            <LabelItem label={l} isSelected={selectedKeys.contains(l.id)} />
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
      {isSelected && <ObsidianIcon size={10} id="check" />}
    </ListBoxItem>
  );
};
