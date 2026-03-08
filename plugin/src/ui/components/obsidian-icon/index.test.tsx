import { render } from "@testing-library/react";
import * as obsidian from "obsidian";
import { describe, expect, it, type MockInstance, vi } from "vitest";

import { ObsidianIcon } from "./index";

describe("ObsidianIcon", () => {
  it("should render div with obsidian-icon class and correct data-icon-size", () => {
    const { container } = render(<ObsidianIcon id="check" size="m" />);

    const div = container.querySelector(".obsidian-icon");
    expect(div).toBeInTheDocument();
    expect(div).toHaveAttribute("data-icon-size", "m");
  });

  it("should call setIcon with correct element and icon ID", () => {
    const spy: MockInstance = vi.spyOn(obsidian, "setIcon");

    render(<ObsidianIcon id="my-icon" size="s" />);

    expect(spy).toHaveBeenCalledWith(expect.any(HTMLElement), "my-icon");
    spy.mockRestore();
  });

  it("should pass through additional HTML attributes", () => {
    const { container } = render(
      <ObsidianIcon id="check" size="l" data-testid="custom" aria-label="icon" />,
    );

    const div = container.querySelector(".obsidian-icon");
    expect(div).toHaveAttribute("data-testid", "custom");
    expect(div).toHaveAttribute("aria-label", "icon");
  });

  it("should merge additional className", () => {
    const { container } = render(<ObsidianIcon id="check" size="s" className="extra-class" />);

    const div = container.querySelector(".obsidian-icon.extra-class");
    expect(div).toBeInTheDocument();
  });
});
