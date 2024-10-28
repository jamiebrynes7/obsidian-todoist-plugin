import { ModalContext, type ModalInfo, PluginContext } from "@/ui/context";
import { Modal, Platform } from "obsidian";
import type React from "react";
import { type Root, createRoot } from "react-dom/client";
import type TodoistPlugin from "..";
import { CreateTaskModal } from "../ui/createTaskModal";
import { OnboardingModal } from "../ui/onboardingModal";

type ModalOptions = {
  title?: string;
  dontCloseOnExternalClick?: boolean;
};

class ReactModal<T extends {}> extends Modal {
  private readonly reactRoot: Root;

  constructor(plugin: TodoistPlugin, Component: React.FC<T>, props: T, opts: ModalOptions) {
    super(plugin.app);
    if (opts.title) {
      this.titleEl.textContent = opts.title;
    }

    this.reactRoot = createRoot(this.contentEl);

    const popoverContainerEl = this.containerEl.createDiv();
    popoverContainerEl.style.position = "relative";

    const modal: ModalInfo = {
      close: () => this.close(),
      popoverContainerEl: popoverContainerEl,
    };

    if (opts.dontCloseOnExternalClick ?? false) {
      // HACK: In order to suppress the click event, we just re-create the element. This works okay because its simple.
      const modalBg = this.containerEl.firstElementChild;
      if (modalBg?.classList.contains("modal-bg")) {
        this.containerEl.removeChild(modalBg);
        createDiv({
          prepend: true,
          parent: this.containerEl,
          cls: ["modal-bg"],
          attr: {
            style: "opacity: 0.85;",
          },
        });
      }
    }

    this.reactRoot.render(
      <PluginContext.Provider value={plugin}>
        <ModalContext.Provider value={modal}>
          <Component {...props} />
        </ModalContext.Provider>
      </PluginContext.Provider>,
    );
  }

  onClose(): void {
    this.reactRoot.unmount();
  }
}

export class ModalHandler {
  private readonly plugin: TodoistPlugin;

  constructor(plugin: TodoistPlugin) {
    this.plugin = plugin;
  }

  public onboarding(props: React.ComponentProps<typeof OnboardingModal>) {
    new ReactModal(this.plugin, OnboardingModal, props, {
      title: "Sync with Todoist Setup",
    }).open();
  }

  public taskCreation(props: React.ComponentProps<typeof CreateTaskModal>) {
    new ReactModal(this.plugin, CreateTaskModal, props, {
      dontCloseOnExternalClick: Platform.isMobileApp,
    }).open();
  }
}
