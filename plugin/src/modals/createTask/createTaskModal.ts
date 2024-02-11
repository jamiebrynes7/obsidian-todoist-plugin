import { App, MarkdownView, Modal } from "obsidian";
import type { ISettings } from "../../settings";
import CreateTaskModalContent from "./CreateTaskModalContent.svelte";
import type { TodoistAdapter } from "../../data";

export default class CreateTaskModal extends Modal {
    private readonly modalContent: CreateTaskModalContent;
    private readonly settings: ISettings;

    constructor(app: App, adapter: TodoistAdapter, settings: ISettings, withPageLink: boolean) {
        super(app);
        this.settings = settings;
        this.titleEl.innerText = "Create new Todoist task";

        const [initialValue, initialCursorPosition] =
            this.getInitialContent(withPageLink);

        this.modalContent = new CreateTaskModalContent({
            target: this.contentEl,
            props: {
                todoistAdapter: adapter,
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
            selection = window.getSelection()?.toString() ?? "";
        }

        const link = this.getPageLink();

        if (!withPageLink || link === null) {
            return [selection, 0];
        }

        return [`${selection} ${link}`, selection.length];
    }

    private getPageLink(): string | null {
        const file = this.app.workspace.getActiveFile();

        if (file == null) {
            return null;
        }
        const encodedVault = encodeURIComponent(file.vault.getName());
        const encodedFilepath = encodeURIComponent(file.path);

        const link = `[${file.path}](obsidian://open?vault=${encodedVault}&file=${encodedFilepath})`;

        if (this.settings.shouldWrapLinksInParens) {
            return `(${link})`;
        }

        return link;
    }
}
