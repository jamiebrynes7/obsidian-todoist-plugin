import { createContext, useContext } from "react";

export type ModalInfo = {
  close: () => void;
  popoverContainerEl: HTMLElement;
};

export const ModalContext = createContext<ModalInfo | undefined>(undefined);

export const useModalContext = () => {
  const modal = useContext(ModalContext);

  if (modal === undefined) {
    throw new Error("ModalContext provider not found");
  }

  return modal;
};
