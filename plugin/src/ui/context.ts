import type { MarkdownRenderChild } from "obsidian";
import { createContext, type Provider, useContext } from "react";
import type { StoreApi, UseBoundStore } from "zustand";

import type TodoistPlugin from "@/index";
import type { TaskQuery } from "@/query/schema/tasks";

type Context<T> = {
  Provider: Provider<T | undefined>;
  use: () => T;
};

const makeContext = <T>(): Context<T> => {
  const context = createContext<T | undefined>(undefined);
  const use = () => {
    const ctx = useContext(context);

    if (ctx === undefined) {
      throw new Error("Context provider not found");
    }

    return ctx;
  };
  return { Provider: context.Provider, use };
};

export const QueryContext = makeContext<TaskQuery>();

export const PluginContext = makeContext<TodoistPlugin>();

export type ModalInfo = {
  close: () => void;
  popoverContainerEl: HTMLElement;
};

export const ModalContext = makeContext<ModalInfo>();

export const RenderChildContext = makeContext<MarkdownRenderChild>();

export type MarkdownEditButton = {
  click: () => void;
};

export const MarkdownEditButtonContext = makeContext<UseBoundStore<StoreApi<MarkdownEditButton>>>();
