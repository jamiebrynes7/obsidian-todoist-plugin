import React, { useState } from "react";
import { Button, FieldError, Group, Input, Label, TextField } from "react-aria-components";
import { TokenValidation } from "../../token";
import { TokenValidationIcon } from "../components/token-validation-icon";

type Props = {
  onTokenSubmit: (token: string) => void;
  tester: (token: string) => Promise<boolean>;
};

export const TokenInputForm: React.FC<Props> = ({ onTokenSubmit, tester }) => {
  const [token, setToken] = useState<string>("");
  const [validationStatus, setValidationStatus] = useState<TokenValidation.Result>({
    kind: "none",
  });

  const onFocusChange = async (isFocused: boolean) => {
    if (isFocused) {
      return;
    }

    setValidationStatus({ kind: "in-progress" });
    const result = await TokenValidation.validate(token, tester);
    setValidationStatus(result);
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
          <TokenValidationIcon status={validationStatus} />
        </Group>
        <FieldError>{validationStatus.kind === "error" ? validationStatus.message : ""}</FieldError>
      </TextField>
      <Button type="submit" isDisabled={!canSubmit} onPress={() => onTokenSubmit(token)}>
        Submit
      </Button>
    </div>
  );
};
