import { App, Modal } from "obsidian";
import type { TodoistApi } from "../../api/api";
import CreateTaskModalContent from "./CreateTaskModalContent.svelte";

export default class CreateTaskModal extends Modal {
  private readonly modalContent: CreateTaskModalContent;

  constructor(app: App, api: TodoistApi) {
    super(app);

    this.titleEl.innerText = "Create new Todoist task";

    this.modalContent = new CreateTaskModalContent({
      target: this.contentEl,
      props: {
        api: api,
        close: () => this.close(),
      },
    });

    this.open();
  }

  onClose() {
    super.onClose();
    this.modalContent.$destroy();
  }
}
