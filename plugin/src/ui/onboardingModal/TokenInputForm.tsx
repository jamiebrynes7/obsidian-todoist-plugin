import React, { useState } from "react";
import { Button, FieldError, Group, Input, Label, TextField } from "react-aria-components";
import { ObsidianIcon } from "../components/obsidian-icon";

const TokenInputValidationIcon: React.FC<{ status: TokenValidationStatus }> = ({ status }) => {
  switch (status.kind) {
    case "none":
      return <></>;
    case "in-progress":
      return <ObsidianIcon id="loader-2" className="token-validation-in-progress" size={16} />;
    case "error":
      return <ObsidianIcon id="x-circle" className="token-validation-error" size={16} />;
    case "success":
      return <ObsidianIcon id="check-circle-2" className="token-validation-success" size={16} />;
  }
};

type TokenValidationStatus =
  | { kind: "none" }
  | { kind: "error"; message: string }
  | { kind: "in-progress" }
  | { kind: "success" };

type Props = {
  onTokenSubmit: (token: string) => void;
  testToken: (token: string) => Promise<boolean>;
};

export const TokenInputForm: React.FC<Props> = ({ onTokenSubmit, testToken }) => {
  const [token, setToken] = useState<string>("");
  const [validationStatus, setValidationStatus] = useState<TokenValidationStatus>({ kind: "none" });

  const onFocusChange = async (isFocused: boolean) => {
    if (isFocused) {
      return;
    }

    if (token.length === 0) {
      setValidationStatus({ kind: "error", message: "API token must not be empty" });
      return;
    }

    setValidationStatus({ kind: "in-progress" });
    const [isValid, _] = await Promise.all([
      testToken(token),
      new Promise<void>((res) => setTimeout(() => res(), 1000)),
    ]);

    if (isValid) {
      setValidationStatus({ kind: "success" });
    } else {
      setValidationStatus({
        kind: "error",
        message: "Oops! Todoist does not recognize this token. Please double check and try again!",
      });
    }
  };

  const canSubmit = token.length > 0 && validationStatus.kind === "success";

  return (
    <div className="todoist-onboarding-token-form">
      <TextField
        value={token}
        onChange={setToken}
        isInvalid={validationStatus.kind === "error"}
        onFocusChange={onFocusChange}
      >
        <Label>API Token</Label>
        <Group>
          <Input />
          <TokenInputValidationIcon status={validationStatus} />
        </Group>
        <FieldError>{validationStatus.kind === "error" ? validationStatus.message : ""}</FieldError>
      </TextField>
      <Button type="submit" isDisabled={!canSubmit} onPress={() => onTokenSubmit(token)}>
        Submit
      </Button>
    </div>
  );
};
