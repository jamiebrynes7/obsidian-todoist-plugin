import type TodoistPlugin from "..";
import { TodoistAdapter } from "../data";
import { ModalHandler } from "./modals";
import { VaultTokenAccessor } from "./tokenAccessor";

export type Services = {
  modals: ModalHandler;
  token: VaultTokenAccessor;
  todoist: TodoistAdapter;
};

export const makeServices = (plugin: TodoistPlugin): Services => {
  return {
    modals: new ModalHandler(plugin),
    token: new VaultTokenAccessor(plugin.app.vault),
    todoist: new TodoistAdapter(),
  };
};
