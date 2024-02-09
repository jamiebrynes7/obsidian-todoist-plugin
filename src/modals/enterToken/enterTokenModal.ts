import { App, Modal } from "obsidian";
import EnterTokenModalContent from "./EnterTokenModalContent.svelte";

type Resolver = () => void;

export default class TodoistApiTokenModal extends Modal {
  public token: string;
  public waitForClose: Promise<void>;

  private resolvePromise: Resolver | undefined = undefined;

  private modalContent: EnterTokenModalContent;

  constructor(app: App) {
    super(app);

    this.token = "";
    this.waitForClose = new Promise(
      (resolve) => (this.resolvePromise = resolve)
    );

    this.titleEl.innerText = "Setup Todoist API token";

    this.modalContent = new EnterTokenModalContent({
      target: this.contentEl,
      props: {
        onSubmit: (value: string) => {
          this.token = value;
          this.close();
        },
      },
    });

    this.open();
  }

  onClose() {
    super.onClose();
    this.modalContent.$destroy();
    this.resolvePromise?.();
  }
}
