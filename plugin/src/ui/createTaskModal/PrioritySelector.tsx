import classNames from "classnames";
import React from "react";
import { Button, type Key, Label, Menu, MenuItem, MenuTrigger } from "react-aria-components";
import { type Priority } from "../../api/domain/task";
import { ObsidianIcon } from "../components/obsidian-icon";
import { Popover } from "./Popover";

type Props = {
  selected: Priority;
  setSelected: (selected: Priority) => void;
};

const options: Priority[] = [4, 3, 2, 1];

export const PrioritySelector: React.FC<Props> = ({ selected, setSelected }) => {
  const onSelected = (key: Key) => {
    if (typeof key === "string") {
      throw Error("unexpected key type");
    }

    // Should be a safe cast since we only use valid priorities
    // as keys.
    setSelected(key as Priority);
  };

  const label = getLabel(selected);
  return (
    <MenuTrigger>
      <Button className="priority-selector" aria-label="Set priority">
        <ObsidianIcon size={16} id="flag" />
        {label}
      </Button>
      <Popover>
        <Menu
          className="task-option-dialog task-priority-menu"
          autoFocus="first"
          aria-label="Task priority options"
          onAction={onSelected}
        >
          {options.map((priority) => {
            const label = getLabel(priority);
            const isSelected = priority === selected;
            const className = classNames("priority-option", { "is-selected": isSelected });
            return (
              <MenuItem className={className} id={priority}>
                <Label>{label}</Label>
              </MenuItem>
            );
          })}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
};

const getLabel = (priority: Priority): string => {
  switch (priority) {
    case 1:
      return "Priority 4";
    case 2:
      return "Priority 3";
    case 3:
      return "Priority 2";
    case 4:
      return "Priority 1";
  }
};
