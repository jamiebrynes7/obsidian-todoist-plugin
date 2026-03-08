import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Callout, type Contents } from "./index";

describe("Callout", () => {
  it("should render title and icon", () => {
    render(<Callout title="Test Title" iconId="info" className="test-class" />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("should render flat string contents as list items", () => {
    const contents: Contents[] = ["Item 1", "Item 2", "Item 3"];

    render(<Callout title="Title" iconId="info" className="test" contents={contents} />);

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();

    const listItems = document.querySelectorAll("li");
    expect(listItems).toHaveLength(3);
  });

  it("should render nested Contents objects with recursive lists", () => {
    const contents: Contents[] = [
      {
        msg: "Parent",
        children: ["Child 1", "Child 2"],
      },
    ];

    render(<Callout title="Title" iconId="info" className="test" contents={contents} />);

    expect(screen.getByText("Parent")).toBeInTheDocument();
    expect(screen.getByText("Child 1")).toBeInTheDocument();
    expect(screen.getByText("Child 2")).toBeInTheDocument();

    const nestedList = document.querySelectorAll("ul ul");
    expect(nestedList).toHaveLength(1);
  });

  it("should render with no contents and no list", () => {
    const { container } = render(<Callout title="Title" iconId="info" className="test" />);

    expect(container.querySelector(".callout-contents")).not.toBeInTheDocument();
  });

  it("should apply className to root element", () => {
    const { container } = render(<Callout title="Title" iconId="info" className="my-class" />);

    expect(container.querySelector(".todoist-callout.my-class")).toBeInTheDocument();
  });
});
