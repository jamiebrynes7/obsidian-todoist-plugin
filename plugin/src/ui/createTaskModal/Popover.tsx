import { Platform } from "obsidian";
import type { PropsWithChildren } from "react";
import React from "react";
import { Popover as AriaPopover, type PopoverProps } from "react-aria-components";
import { useModalContext } from "../context/modal";

export const Popover: React.FC<PropsWithChildren> = ({ children }) => {
  const modal = useModalContext();

  return (
    <AriaPopover
      maxHeight={500}
      offset={5}
      UNSTABLE_portalContainer={modal.popoverContainerEl}
      className="modal-popover"
      {...getPlacementDetails()}
    >
      {children}
    </AriaPopover>
  );
};

type PlacementDetails = Pick<PopoverProps, "placement" | "shouldFlip">;

export const getPlacementDetails = (): PlacementDetails => {
  if (Platform.isMobile) {
    return {
      placement: "top left",
      shouldFlip: false,
    };
  }

  return {
    placement: "bottom left",
    shouldFlip: false,
  };
};
