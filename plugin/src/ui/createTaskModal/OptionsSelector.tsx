import cn from "classnames";
import type React from "react";
import { Button, type Key, Menu, MenuItem, MenuTrigger } from "react-aria-components";

import { t } from "@/i18n";
import { ObsidianIcon } from "@/ui/components/obsidian-icon";
import type { TaskCreationOptions } from "@/ui/createTaskModal";
import { Popover } from "@/ui/createTaskModal/Popover";

type Props = {
  selected: TaskCreationOptions;
  setSelected: (selected: TaskCreationOptions) => void;
};

export const OptionsSelector: React.FC<Props> = ({ selected, setSelected }) => {
  const i18n = t().createTaskModal.optionsSelector;

  const onAction = (key: Key) => {
    if (key === "add-link-to-content") {
      setSelected({
        ...selected,
        appendLinkTo: "content",
      });
    } else if (key === "add-link-to-description") {
      setSelected({
        ...selected,
        appendLinkTo: "description",
      });
    } else if (key === "do-not-add-link") {
      setSelected({
        ...selected,
        appendLinkTo: undefined,
      });
    }
  };

  const items: Array<{
    key: string;
    label: string;
    isSelected: boolean;
  }> = [
    {
      key: "add-link-to-content",
      label: i18n.addLinkToContent,
      isSelected: selected.appendLinkTo === "content",
    },
    {
      key: "add-link-to-description",
      label: i18n.addLinkToDescription,
      isSelected: selected.appendLinkTo === "description",
    },
    {
      key: "do-not-add-link",
      label: i18n.doNotAddLink,
      isSelected: selected.appendLinkTo === undefined,
    },
  ];

  return (
    <MenuTrigger>
      <Button className="options-selector" aria-label={i18n.buttonLabel}>
        <ObsidianIcon size="m" id="ellipsis-vertical" />
      </Button>
      <Popover>
        <Menu
          className="task-option-dialog task-options-menu"
          aria-label={i18n.optionsLabel}
          onAction={onAction}
        >
          {items.map((item) => (
            <MenuItem
              key={item.key}
              id={item.key}
              className={cn("task-option-dialog-item", {
                "is-selected": item.isSelected,
              })}
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
};
