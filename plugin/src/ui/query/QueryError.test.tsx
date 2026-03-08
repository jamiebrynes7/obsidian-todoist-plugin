import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ParsingError } from "@/query/parser";

import { QueryError } from "./QueryError";

describe("QueryError", () => {
  it("should render ParsingError messages", () => {
    const error = new ParsingError(["Invalid filter", "Missing field"]);

    render(<QueryError error={error} />);

    expect(screen.getByText("Error: Query parsing failed")).toBeInTheDocument();
    expect(screen.getByText("Invalid filter")).toBeInTheDocument();
    expect(screen.getByText("Missing field")).toBeInTheDocument();
  });

  it("should render generic Error message", () => {
    const error = new Error("Something went wrong");

    render(<QueryError error={error} />);

    expect(screen.getByText("Error: Query parsing failed")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("should render unknown error fallback for non-Error objects", () => {
    render(<QueryError error="not an error" />);

    expect(screen.getByText("Error: Query parsing failed")).toBeInTheDocument();
    expect(screen.getByText(/Unknown error occurred/)).toBeInTheDocument();
  });
});
