import { ModalContext } from "@/ui/context";
import { Platform } from "obsidian";
import type { PropsWithChildren } from "react";
import type React from "react";
import { Popover as AriaPopover, type PopoverProps } from "react-aria-components";

type Props = {
  maxHeight?: number;
  defaultPlacement?: PlacementDetails["placement"];
};

export const Popover: React.FC<PropsWithChildren<Props>> = ({
  children,
  defaultPlacement,
  maxHeight,
}) => {
  const modal = ModalContext.use();

  return (
    <AriaPopover
      maxHeight={maxHeight ?? 500}
      offset={5}
      UNSTABLE_portalContainer={modal.popoverContainerEl}
      className="modal-popover"
      {...getPlacementDetails(defaultPlacement)}
    >
      {children}
    </AriaPopover>
  );
};

type PlacementDetails = Pick<PopoverProps, "placement" | "shouldFlip">;

export const getPlacementDetails = (
  defaultPlacement: PlacementDetails["placement"] = undefined,
): PlacementDetails => {
  if (Platform.isMobile) {
    return {
      placement: "top left",
      shouldFlip: false,
    };
  }

  return {
    placement: defaultPlacement ?? "bottom left",
    shouldFlip: false,
  };
};
