import { TodoistAdapter } from "@/data";
import type TodoistPlugin from "@/index";
import { ModalHandler } from "@/services/modals";
import { VaultTokenAccessor } from "@/services/tokenAccessor";

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
