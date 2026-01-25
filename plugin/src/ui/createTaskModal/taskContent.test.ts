import { describe, expect, it } from "vitest";

import type { AddTaskAction } from "@/settings";

import {
  type BuildTaskContentOptions,
  buildClipboardMarkdown,
  buildTaskContent,
  type FileInfo,
  type TaskInfo,
} from "./taskContent";

describe("buildTaskContent", () => {
  const defaultFile: FileInfo = {
    name: "My Note.md",
    path: "folder/My Note.md",
    vaultName: "Test Vault",
  };

  const testCases: {
    name: string;
    content: string;
    file: FileInfo | undefined;
    options: BuildTaskContentOptions;
    expected: string;
  }[] = [
    {
      name: "returns content unchanged when appendLink is false",
      content: "Buy groceries",
      file: defaultFile,
      options: { appendLink: false, wrapInParens: false },
      expected: "Buy groceries",
    },
    {
      name: "returns content unchanged when file is undefined",
      content: "Buy groceries",
      file: undefined,
      options: { appendLink: true, wrapInParens: false },
      expected: "Buy groceries",
    },
    {
      name: "appends link when appendLink is true",
      content: "Buy groceries",
      file: defaultFile,
      options: { appendLink: true, wrapInParens: false },
      expected:
        "Buy groceries [My Note.md](obsidian://open?vault=Test%20Vault&file=folder%2FMy%20Note.md)",
    },
    {
      name: "wraps link in parens when wrapInParens is true",
      content: "Buy groceries",
      file: defaultFile,
      options: { appendLink: true, wrapInParens: true },
      expected:
        "Buy groceries ([My Note.md](obsidian://open?vault=Test%20Vault&file=folder%2FMy%20Note.md))",
    },
    {
      name: "handles empty content with appendLink",
      content: "",
      file: defaultFile,
      options: { appendLink: true, wrapInParens: false },
      expected: " [My Note.md](obsidian://open?vault=Test%20Vault&file=folder%2FMy%20Note.md)",
    },
    {
      name: "encodes special characters in file path",
      content: "Task",
      file: {
        name: "Notes & Ideas.md",
        path: "Projects/Notes & Ideas.md",
        vaultName: "My Vault",
      },
      options: { appendLink: true, wrapInParens: false },
      expected:
        "Task [Notes & Ideas.md](obsidian://open?vault=My%20Vault&file=Projects%2FNotes%20%26%20Ideas.md)",
    },
  ];

  for (const tc of testCases) {
    it(tc.name, () => {
      const result = buildTaskContent(tc.content, tc.file, tc.options);
      expect(result).toBe(tc.expected);
    });
  }
});

describe("buildClipboardMarkdown", () => {
  const defaultTask: TaskInfo = {
    id: "12345",
    projectId: "67890",
    content: "Buy groceries",
  };

  const testCases: {
    name: string;
    task: TaskInfo;
    variant: Exclude<AddTaskAction, "add">;
    expected: string;
  }[] = [
    {
      name: "builds app URL variant",
      task: defaultTask,
      variant: "add-copy-app",
      expected: "[Buy groceries](todoist://task?id=12345)",
    },
    {
      name: "builds web URL variant",
      task: defaultTask,
      variant: "add-copy-web",
      expected: "[Buy groceries](https://todoist.com/app/project/67890/task/12345)",
    },
    {
      name: "handles task content with special markdown characters",
      task: {
        id: "111",
        projectId: "222",
        content: "Review [draft] document",
      },
      variant: "add-copy-app",
      expected: "[Review [draft] document](todoist://task?id=111)",
    },
  ];

  for (const tc of testCases) {
    it(tc.name, () => {
      const result = buildClipboardMarkdown(tc.task, tc.variant);
      expect(result).toBe(tc.expected);
    });
  }
});
