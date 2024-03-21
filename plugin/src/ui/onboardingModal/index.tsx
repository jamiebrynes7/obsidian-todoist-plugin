import { Notice } from "obsidian";
import React from "react";
import type { WithModalProps } from "../../services/modals";
import { TokenValidation } from "../../token";
import { TokenInputForm } from "./TokenInputForm";
import "./styles.scss";

type OnTokenSubmitted = (token: string) => Promise<void>;

type OnboardingProps = {
  onTokenSubmit: OnTokenSubmitted;
};

export const OnboardingModal: React.FC<WithModalProps<OnboardingProps>> = ({
  close,
  onTokenSubmit,
}) => {
  const callback = (token: string) => {
    close();
    onTokenSubmit(token).catch((e) => {
      console.error("Failed to save API token", e);
      new Notice("Failed to save API token");
    });
  };

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
      <TokenInputForm onTokenSubmit={callback} tester={TokenValidation.DefaultTester} />
    </div>
  );
};
