import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyDisplay } from "./EmptyDisplay";

describe("EmptyDisplay", () => {
  it("should render default i18n message when no message prop", () => {
    render(<EmptyDisplay />);

    expect(screen.getByText("The query returned no tasks")).toBeInTheDocument();
  });

  it("should render custom message when message prop provided", () => {
    render(<EmptyDisplay message="Nothing here!" />);

    expect(screen.getByText("Nothing here!")).toBeInTheDocument();
  });
});
