import { render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { create } from "zustand";

import { type MarkdownEditButton, MarkdownEditButtonContext, PluginContext } from "@/ui/context";

import { QueryHeader } from "./QueryHeader";

const mockPlugin = {
  services: {
    todoist: {
      actions: {
        closeTask: vi.fn(),
      },
    },
  },
} as unknown as ReturnType<typeof PluginContext.use>;

const mockEditClick = vi.fn();
const mockEditButtonStore = create<MarkdownEditButton>(() => ({
  click: mockEditClick,
}));

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <PluginContext.Provider value={mockPlugin}>
      <MarkdownEditButtonContext.Provider value={mockEditButtonStore}>
        {children}
      </MarkdownEditButtonContext.Provider>
    </PluginContext.Provider>
  );
};

describe("QueryHeader", () => {
  it("should render query title", () => {
    render(
      <QueryHeader
        title="My Tasks"
        isFetching={false}
        refresh={vi.fn()}
        refreshedTimestamp={undefined}
      />,
      { wrapper: Wrapper },
    );

    expect(screen.getByText("My Tasks")).toBeInTheDocument();
  });

  it("should render three control buttons", () => {
    const { container } = render(
      <QueryHeader
        title="Tasks"
        isFetching={false}
        refresh={vi.fn()}
        refreshedTimestamp={undefined}
      />,
      { wrapper: Wrapper },
    );

    expect(container.querySelector(".add-task")).toBeInTheDocument();
    expect(container.querySelector(".refresh-query")).toBeInTheDocument();
    expect(container.querySelector(".edit-query")).toBeInTheDocument();
  });

  it("should show 'is-refreshing' class during fetch", () => {
    const { container } = render(
      <QueryHeader
        title="Tasks"
        isFetching={true}
        refresh={vi.fn()}
        refreshedTimestamp={undefined}
      />,
      { wrapper: Wrapper },
    );

    expect(container.querySelector(".refresh-query.is-refreshing")).toBeInTheDocument();
  });

  it("should not show 'is-refreshing' class when not fetching", () => {
    const { container } = render(
      <QueryHeader
        title="Tasks"
        isFetching={false}
        refresh={vi.fn()}
        refreshedTimestamp={undefined}
      />,
      { wrapper: Wrapper },
    );

    expect(container.querySelector(".refresh-query.is-refreshing")).not.toBeInTheDocument();
  });
});
