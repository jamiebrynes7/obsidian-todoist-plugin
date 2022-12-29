import { App, MarkdownView, Modal } from "obsidian";
import type { TodoistApi } from "../../api/api";
import CreateTaskModalContent from "./CreateTaskModalContent.svelte";

export default class CreateTaskModal extends Modal {
  private readonly modalContent: CreateTaskModalContent;

  constructor(app: App, api: TodoistApi, withPageLink: boolean) {
    super(app);

    this.titleEl.innerText = "Create new Todoist task";

    const [initialValue, initialCursorPosition] =
      this.getInitialContent(withPageLink);

    this.modalContent = new CreateTaskModalContent({
      target: this.contentEl,
      props: {
        api: api,
        close: () => this.close(),
        value: initialValue,
        initialCursorPosition: initialCursorPosition,
      },
    });

    this.open();
  }

  onClose() {
    super.onClose();
    this.modalContent.$destroy();
  }

  private getInitialContent(withPageLink: boolean): [string, number] {
    let selection = this.app.workspace
      .getActiveViewOfType(MarkdownView)
      ?.editor?.getSelection();

    if (selection == null || selection === "") {
      selection = window.getSelection().toString();
    }

    if (!withPageLink) {
      return [selection, 0];
    }

    const file = this.app.workspace.getActiveFile();

    if (file == null) {
      return [selection, 0];
    }

    const vaultName = file.vault.getName();
    const filePath = file.path;

    const link = `[${filePath}](obsidian://open?vault=${encodeURIComponent(
      vaultName
    )}&file=${encodeURIComponent(filePath)})`;

    return [`${selection} ${link}`, selection.length];
  }
}
