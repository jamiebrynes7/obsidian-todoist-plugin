import { createContext, useContext } from "react";
import TodoistPlugin from "../..";

export const PluginContext = createContext<TodoistPlugin | undefined>(undefined);

export const usePluginContext = () => {
  const plugin = useContext(PluginContext);

  if (plugin === undefined) {
    throw new Error("PluginContext provider not found");
  }

  return plugin;
};
