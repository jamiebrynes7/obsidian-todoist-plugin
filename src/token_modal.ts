import { App, Modal } from "obsidian";

export default class TodoistApiTokenModal extends Modal {
  public Result: Promise<string>;

  private resolvePromise: (string) => void;
  private rejectPromise: (any) => void;

  private input: HTMLInputElement;

  constructor(app: App) {
    super(app);

    this.titleEl.innerText = "Setup Todoist API token";

    var content = document
      .createDocumentFragment()
      .createEl("div", { cls: "setting-item" });

    var info = content.createEl("div", { cls: "setting-item-info" });
    info.createEl(
      "div",
      { cls: "setting-item-name" },
      (ele) => (ele.innerText = "Todoist token")
    );
    info.createEl("div", { cls: "setting-item-description" }, (ele) => {
      const span = ele.createEl("span") as HTMLSpanElement;
      span.innerText = "You can find the token ";

      var link = span.createEl("a") as HTMLAnchorElement;
      link.href = "https://todoist.com/prefs/integrations";
      link.innerText = "here!";
    });

    var control = content.createEl("div", { cls: "setting-item-control" });
    this.input = control.createEl("input") as HTMLInputElement;
    this.input.type = "text";
    this.input.placeholder = "API Token";

    this.Result = new Promise<string>((resolve, reject) => {
      this.resolvePromise = resolve;
      this.rejectPromise = reject;
    });

    this.contentEl.appendChild(content);
    this.contentEl.createEl(
      "button",
      { cls: "mod-cta", attr: { style: "float: right" } },
      (ele) => {
        ele.innerText = "Submit";
        ele.onClickEvent(() => this.close());
      }
    );

    this.open();
  }

  onClose() {
    super.onClose();
    this.resolvePromise(this.input.value);
  }
}
