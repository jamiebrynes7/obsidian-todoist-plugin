import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Button, FieldError, Group, Input, Label, TextField } from "react-aria-components";

import { t } from "@/i18n";
import debug from "@/log";
import { TokenValidation } from "@/token";
import { TokenValidationIcon } from "@/ui/components/token-validation-icon";

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

  const onTokenChange = (newToken: string) => {
    setToken(newToken.trim());
  };

  const pasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      onTokenChange(clipboardText);
    } catch (e) {
      console.error("Failed to read from clipboard", e);
    }
  };

  // The epoch ensures that only the latest validation request is processed.
  // The debounce ensures that we don't fire off too many requests.
  const validationEpoch = useRef(0);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  // When the token changes, queue up a debounced validation attempt.
  useEffect(() => {
    validationEpoch.current += 1;
    setValidationStatus({ kind: "in-progress" });

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    const timeoutId = setTimeout(() => {
      const epoch = ++validationEpoch.current;

      debug({ msg: "Validating token", context: { token, epoch } });
      TokenValidation.validate(token, tester).then((result) => {
        debug({
          msg: "Token validation result",
          context: { token, epochBefore: epoch, epochAfter: validationEpoch.current, result },
        });
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
      <TextField
        value={token}
        onChange={onTokenChange}
        isInvalid={validationStatus.kind === "error"}
      >
        <Label>{i18n.tokenInputLabel}</Label>
        <Group>
          <Input />
          <TokenValidationIcon status={validationStatus} />
        </Group>
        <FieldError>{validationStatus.kind === "error" ? validationStatus.message : ""}</FieldError>
      </TextField>
      <div className="controls">
        <Button type="button" onPress={pasteFromClipboard}>
          {i18n.pasteButtonLabel}
        </Button>
        <Button
          type="submit"
          isDisabled={!canSubmit}
          onPress={() => onTokenSubmit(token)}
          className="mod-cta"
          data-testid="submit-button"
        >
          {i18n.submitButtonLabel}
        </Button>
      </div>
    </div>
  );
};
