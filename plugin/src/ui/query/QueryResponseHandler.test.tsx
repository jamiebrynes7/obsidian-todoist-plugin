import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { SubscriptionResult } from "@/data";
import type { TaskQuery } from "@/query/schema/tasks";

import { QueryResponseHandler } from "./QueryResponseHandler";

function makeQuery(opts?: Partial<TaskQuery>): TaskQuery {
  return {
    filter: opts?.filter ?? "",
    name: opts?.name,
    autorefresh: opts?.autorefresh,
    sorting: opts?.sorting,
    show: opts?.show,
    groupBy: opts?.groupBy,
    view: opts?.view,
  };
}

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
