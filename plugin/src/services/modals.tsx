import { Modal } from "obsidian";
import React from "react";
import { type Root, createRoot } from "react-dom/client";
import type TodoistPlugin from "..";
import { OnboardingModal } from "../ui/onboardingModal";

type ModalProps = {
  close: () => void;
  plugin: TodoistPlugin;
};

export type WithModalProps<T> = ModalProps & T;

type WithoutModalProps<T> = Omit<T, keyof ModalProps>;

class ReactModal<T> extends Modal {
  private readonly reactRoot: Root;
  constructor(plugin: TodoistPlugin, title: string, Component: React.FC<T & ModalProps>, props: T) {
    super(plugin.app);
    this.titleEl.textContent = title;

    const { contentEl } = this;
    contentEl.empty();

    this.reactRoot = createRoot(contentEl);

    this.reactRoot.render(<Component {...props} close={() => this.close()} plugin={plugin} />);
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

  public onboarding(props: WithoutModalProps<React.ComponentProps<typeof OnboardingModal>>): Modal {
    return new ReactModal(this.plugin, "Sync with Todoist Setup", OnboardingModal, props);
  }
}
