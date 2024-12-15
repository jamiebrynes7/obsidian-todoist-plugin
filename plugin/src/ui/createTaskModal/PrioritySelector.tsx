import { t } from "@/i18n";
import type { Translations } from "@/i18n/translation";
import classNames from "classnames";
import type React from "react";
import { Button, type Key, Label, Menu, MenuItem, MenuTrigger } from "react-aria-components";
import type { Priority } from "../../api/domain/task";
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

  const i18n = t().createTaskModal.prioritySelector;

  const label = getLabel(selected, i18n);
  return (
    <MenuTrigger>
      <Button className="priority-selector" aria-label={i18n.buttonLabel}>
        <ObsidianIcon size="m" id="flag" />
        {label}
      </Button>
      <Popover>
        <Menu
          className="task-option-dialog task-priority-menu"
          autoFocus="first"
          aria-label={i18n.optionsLabel}
          onAction={onSelected}
        >
          {options.map((priority) => {
            const label = getLabel(priority, i18n);
            const isSelected = priority === selected;
            const className = classNames("priority-option", { "is-selected": isSelected });
            return (
              <MenuItem key={priority} className={className} id={priority}>
                <Label>{label}</Label>
              </MenuItem>
            );
          })}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
};

const getLabel = (
  priority: Priority,
  i18n: Translations["createTaskModal"]["prioritySelector"],
): string => {
  switch (priority) {
    case 1:
      return i18n.p4;
    case 2:
      return i18n.p3;
    case 3:
      return i18n.p2;
    case 4:
      return i18n.p1;
  }
};
