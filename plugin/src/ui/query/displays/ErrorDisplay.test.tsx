import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { QueryErrorKind } from "@/data";

import { ErrorDisplay } from "./ErrorDisplay";

describe("ErrorDisplay", () => {
  it("should render bad request error message", () => {
    render(<ErrorDisplay kind={QueryErrorKind.BadRequest} />);

    expect(screen.getByText(/rejected the request/)).toBeInTheDocument();
  });

  it("should render unauthorized error message for Unauthorized kind", () => {
    render(<ErrorDisplay kind={QueryErrorKind.Unauthorized} />);

    expect(screen.getByText(/incorrect credentials/)).toBeInTheDocument();
  });

  it("should render unauthorized error message for Forbidden kind", () => {
    render(<ErrorDisplay kind={QueryErrorKind.Forbidden} />);

    expect(screen.getByText(/incorrect credentials/)).toBeInTheDocument();
  });

  it("should render server error message", () => {
    render(<ErrorDisplay kind={QueryErrorKind.ServerError} />);

    expect(screen.getByText(/returned an error/)).toBeInTheDocument();
  });

  it("should render unknown error message for unrecognized kinds", () => {
    render(<ErrorDisplay kind={QueryErrorKind.Unknown} />);

    expect(screen.getByText(/Unknown error occurred/)).toBeInTheDocument();
  });

  it("should render error header", () => {
    render(<ErrorDisplay kind={QueryErrorKind.BadRequest} />);

    expect(screen.getByText("Error")).toBeInTheDocument();
  });
});
