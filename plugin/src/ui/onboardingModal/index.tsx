import { App, Modal, Notice } from "obsidian";
import React from "react";
import { type Root, createRoot } from "react-dom/client";
import { TokenValidation } from "../../token";
import { TokenInputForm } from "./TokenInputForm";
import "./styles.scss";

type OnTokenSubmitted = (token: string) => Promise<void>;

export class OnboardingModal extends Modal {
  private readonly onTokenSubmitted: OnTokenSubmitted;
  private readonly reactRoot: Root;

  constructor(app: App, onTokenSubmitted: OnTokenSubmitted) {
    super(app);
    this.onTokenSubmitted = onTokenSubmitted;
    this.titleEl.textContent = "Sync with Todoist Setup";

    const { contentEl } = this;
    contentEl.empty();
    this.reactRoot = createRoot(contentEl);

    const callback = (token: string) => {
      this.close();
      this.onTokenSubmitted(token).catch((e) => {
        console.error("Failed to save API token", e);
        new Notice("Failed to save API token");
      });
    };

    this.reactRoot.render(<ModalRoot onTokenSubmit={callback} />);
  }

  onClose(): void {
    super.onClose();
    this.reactRoot.unmount();
  }
}

type Props = {
  onTokenSubmit: (token: string) => void;
};

const ModalRoot: React.FC<Props> = ({ onTokenSubmit }) => {
  return (
    <div className="onboarding-modal-root">
      <p>
        In order to use this plugin, you must provide your Todoist API token. This allows us to read
        and write data to or from your Todoist account.
      </p>
      <p>
        You can follow{" "}
        <a href="https://todoist.com/help/articles/find-your-api-token-Jpzx9IIlB">
          Todoist's guide
        </a>{" "}
        on finding your API token.
      </p>
      <TokenInputForm onTokenSubmit={onTokenSubmit} tester={TokenValidation.DefaultTester} />
    </div>
  );
};
