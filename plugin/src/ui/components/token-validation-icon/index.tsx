import type React from "react";
import type { TokenValidation } from "../../../token";
import { ObsidianIcon } from "../obsidian-icon";
import "./styles.scss";

export const TokenValidationIcon: React.FC<{ status: TokenValidation.Result }> = ({ status }) => {
  switch (status.kind) {
    case "none":
      return <></>;
    case "in-progress":
      return <ObsidianIcon id="loader-2" className="token-validation-in-progress" size="m" />;
    case "error":
      return <ObsidianIcon id="x-circle" className="token-validation-error" size="m" />;
    case "success":
      return <ObsidianIcon id="check-circle-2" className="token-validation-success" size="m" />;
  }
};
