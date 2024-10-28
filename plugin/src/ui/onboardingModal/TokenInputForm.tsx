import { t } from "@/i18n";
import { TokenValidation } from "@/token";
import { TokenValidationIcon } from "@/ui/components/token-validation-icon";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Button, FieldError, Group, Input, Label, TextField } from "react-aria-components";

type Props = {
  onTokenSubmit: (token: string) => void;
  tester: (token: string) => Promise<boolean>;
};

export const TokenInputForm: React.FC<Props> = ({ onTokenSubmit, tester }) => {
  const i18n = t().onboardingModal;
  const [token, setToken] = useState<string>("");
  const [validationStatus, setValidationStatus] = useState<TokenValidation.Result>({
    kind: "none",
  });

  // The epoch ensures that only the latest validation request is processed.
  // The debounce ensures that we don't fire off too many requests.
  const validationEpoch = useRef(0);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  // When the token changes, queue up a debounced validation attempt.
  useEffect(() => {
    setValidationStatus({ kind: "in-progress" });

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    const timeoutId = setTimeout(() => {
      const epoch = ++validationEpoch.current;
      TokenValidation.validate(token, tester).then((result) => {
        if (epoch === validationEpoch.current) {
          setValidationStatus(result);
        }
      });
    }, 500);

    debounceTimeout.current = timeoutId;
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [token, tester]);

  const canSubmit = token.length > 0 && validationStatus.kind === "success";

  return (
    <div className="todoist-onboarding-token-form">
      <TextField value={token} onChange={setToken} isInvalid={validationStatus.kind === "error"}>
        <Label>{i18n.tokenInputLabel}</Label>
        <Group>
          <Input />
          <TokenValidationIcon status={validationStatus} />
        </Group>
        <FieldError>{validationStatus.kind === "error" ? validationStatus.message : ""}</FieldError>
      </TextField>
      <Button type="submit" isDisabled={!canSubmit} onPress={() => onTokenSubmit(token)}>
        {i18n.submitButtonLabel}
      </Button>
    </div>
  );
};
