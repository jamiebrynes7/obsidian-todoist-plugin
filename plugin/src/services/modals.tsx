import { Modal } from "obsidian";
import React from "react";
import { type Root, createRoot } from "react-dom/client";
import type TodoistPlugin from "..";
import { ModalContext, type ModalInfo } from "../ui/context/modal";
import { PluginContext } from "../ui/context/plugin";
import { OnboardingModal } from "../ui/onboardingModal";

type ModalOptions = {
  extraModalClass?: string;
  title?: string;
};

class ReactModal<T extends {}> extends Modal {
  private readonly reactRoot: Root;
  constructor(plugin: TodoistPlugin, Component: React.FC<T>, props: T, opts: ModalOptions) {
    super(plugin.app);
    this.titleEl.textContent = opts.title ?? null;

    if (opts?.extraModalClass !== undefined) {
      this.modalEl.addClass(opts.extraModalClass);
    }

    const { contentEl } = this;
    contentEl.empty();

    this.reactRoot = createRoot(contentEl);

    const popoverContainerEl = this.containerEl.createDiv();
    popoverContainerEl.style.position = "relative";

    const modal: ModalInfo = {
      close: () => this.close(),
      popoverContainerEl: popoverContainerEl,
    };

    this.reactRoot.render(
      <PluginContext.Provider value={plugin}>
        <ModalContext.Provider value={modal}>
          <Component {...props} />
        </ModalContext.Provider>
      </PluginContext.Provider>,
    );
  }

  onClose(): void {
    super.onClose();
    this.reactRoot.unmount();
  }
}

export class ModalHandler {
  private readonly plugin: TodoistPlugin;

  constructor(plugin: TodoistPlugin) {
    this.plugin = plugin;
  }

  public onboarding(props: React.ComponentProps<typeof OnboardingModal>): Modal {
    return new ReactModal(this.plugin, OnboardingModal, props, {
      title: "Sync with Todoist Setup",
    });
  }
}
