import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { SubscriptionResult } from "@/data";
import { QueryErrorKind } from "@/data";
import { makeQuery } from "@/factories/query";

import { QueryResponseHandler } from "./QueryResponseHandler";

describe("QueryResponseHandler - no tasks rendering", () => {
  const emptyResult: SubscriptionResult = {
    type: "success",
    tasks: [],
  };

  it("should render empty display when there are no tasks", () => {
    const query = makeQuery({ filter: "today" });

    render(<QueryResponseHandler result={emptyResult} query={query} />);

    expect(screen.getByText("The query returned no tasks")).toBeInTheDocument();
  });

  it("should render custom message when noTasksMessage is set", () => {
    const query = makeQuery({
      filter: "today",
      view: { noTasksMessage: "All caught up!" },
    });

    render(<QueryResponseHandler result={emptyResult} query={query} />);

    expect(screen.getByText("All caught up!")).toBeInTheDocument();
  });

  it("should render nothing when hideNoTasks is true", () => {
    const query = makeQuery({
      filter: "today",
      view: { hideNoTasks: true },
    });

    const { container } = render(<QueryResponseHandler result={emptyResult} query={query} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("should render empty display when hideNoTasks is false", () => {
    const query = makeQuery({
      filter: "today",
      view: { hideNoTasks: false },
    });

    render(<QueryResponseHandler result={emptyResult} query={query} />);

    expect(screen.getByText("The query returned no tasks")).toBeInTheDocument();
  });
});

describe("QueryResponseHandler - error rendering", () => {
  const query = makeQuery({ filter: "today" });

  it("should render ErrorDisplay for bad request errors", () => {
    const result: SubscriptionResult = {
      type: "error",
      kind: QueryErrorKind.BadRequest,
    };

    render(<QueryResponseHandler result={result} query={query} />);

    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText(/rejected the request/)).toBeInTheDocument();
  });

  it("should render ErrorDisplay for unauthorized errors", () => {
    const result: SubscriptionResult = {
      type: "error",
      kind: QueryErrorKind.Unauthorized,
    };

    render(<QueryResponseHandler result={result} query={query} />);

    expect(screen.getByText(/incorrect credentials/)).toBeInTheDocument();
  });

  it("should render ErrorDisplay for forbidden errors", () => {
    const result: SubscriptionResult = {
      type: "error",
      kind: QueryErrorKind.Forbidden,
    };

    render(<QueryResponseHandler result={result} query={query} />);

    expect(screen.getByText(/incorrect credentials/)).toBeInTheDocument();
  });

  it("should render ErrorDisplay for server errors", () => {
    const result: SubscriptionResult = {
      type: "error",
      kind: QueryErrorKind.ServerError,
    };

    render(<QueryResponseHandler result={result} query={query} />);

    expect(screen.getByText(/returned an error/)).toBeInTheDocument();
  });

  it("should render ErrorDisplay for unknown errors", () => {
    const result: SubscriptionResult = {
      type: "error",
      kind: QueryErrorKind.Unknown,
    };

    render(<QueryResponseHandler result={result} query={query} />);

    expect(screen.getByText(/Unknown error occurred/)).toBeInTheDocument();
  });
});

describe("QueryResponseHandler - not ready rendering", () => {
  it("should render NotReadyDisplay for not-ready results", () => {
    const result: SubscriptionResult = { type: "not-ready" };
    const query = makeQuery({ filter: "today" });

    const { container } = render(<QueryResponseHandler result={result} query={query} />);

    expect(container).toBeEmptyDOMElement();
  });
});
