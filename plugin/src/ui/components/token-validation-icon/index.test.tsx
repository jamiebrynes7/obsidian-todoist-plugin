import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { TokenValidation } from "@/token";

import { TokenValidationIcon } from "./index";

describe("TokenValidationIcon", () => {
  it("should return null for kind 'none'", () => {
    const status: TokenValidation.Result = { kind: "none" };
    const { container } = render(<TokenValidationIcon status={status} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("should render loader icon for 'in-progress' status", () => {
    const status: TokenValidation.Result = { kind: "in-progress" };
    const { container } = render(<TokenValidationIcon status={status} />);

    const icon = container.querySelector(".token-validation-in-progress");
    expect(icon).toBeInTheDocument();
  });

  it("should render error icon for 'error' status", () => {
    const status: TokenValidation.Result = { kind: "error", message: "Bad token" };
    const { container } = render(<TokenValidationIcon status={status} />);

    const icon = container.querySelector(".token-validation-error");
    expect(icon).toBeInTheDocument();
  });

  it("should render success icon for 'success' status", () => {
    const status: TokenValidation.Result = { kind: "success" };
    const { container } = render(<TokenValidationIcon status={status} />);

    const icon = container.querySelector(".token-validation-success");
    expect(icon).toBeInTheDocument();
  });
});
