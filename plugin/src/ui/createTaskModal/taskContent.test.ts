import { describe, expect, it } from "vitest";

import {
  type BuildClipboardMarkdownOptions,
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
  };

  const defaultFile: FileInfo = {
    name: "My Note.md",
    path: "folder/My Note.md",
    vaultName: "Test Vault",
  };

  const testCases: {
    name: string;
    content: string;
    task: TaskInfo;
    options: BuildClipboardMarkdownOptions;
    fileInfo: FileInfo | undefined;
    expected: string;
  }[] = [
    {
      name: "builds app URL variant without file link",
      content: "Buy groceries",
      task: defaultTask,
      options: { appendLink: false, variant: "add-copy-app" },
      fileInfo: undefined,
      expected: "Buy groceries [Todoist](todoist://task?id=12345)",
    },
    {
      name: "builds web URL variant without file link",
      content: "Buy groceries",
      task: defaultTask,
      options: { appendLink: false, variant: "add-copy-web" },
      fileInfo: undefined,
      expected: "Buy groceries [Todoist](https://todoist.com/app/project/67890/task/12345)",
    },
    {
      name: "appends obsidian backlink when appendLink is true",
      content: "Buy groceries",
      task: defaultTask,
      options: { appendLink: true, variant: "add-copy-app" },
      fileInfo: defaultFile,
      expected: "Buy groceries [[folder/My Note.md|My Note]] [Todoist](todoist://task?id=12345)",
    },
    {
      name: "should only strip the final extension in backlink",
      content: "Buy groceries",
      task: defaultTask,
      options: { appendLink: true, variant: "add-copy-app" },
      fileInfo: {
        name: "Archive.tar.gz.md",
        path: "folder/Archive.tar.gz.md",
        vaultName: "Test Vault",
      },
      expected:
        "Buy groceries [[folder/Archive.tar.gz.md|Archive.tar.gz]] [Todoist](todoist://task?id=12345)",
    },
    {
      name: "does not append backlink when fileInfo is undefined",
      content: "Buy groceries",
      task: defaultTask,
      options: { appendLink: true, variant: "add-copy-app" },
      fileInfo: undefined,
      expected: "Buy groceries [Todoist](todoist://task?id=12345)",
    },
    {
      name: "handles task content with special markdown characters",
      content: "Review [draft] document",
      task: { id: "111", projectId: "222" },
      options: { appendLink: false, variant: "add-copy-app" },
      fileInfo: undefined,
      expected: "Review [draft] document [Todoist](todoist://task?id=111)",
    },
  ];

  for (const tc of testCases) {
    it(tc.name, () => {
      const result = buildClipboardMarkdown(tc.content, tc.task, tc.options, tc.fileInfo);
      expect(result).toBe(tc.expected);
    });
  }
});
