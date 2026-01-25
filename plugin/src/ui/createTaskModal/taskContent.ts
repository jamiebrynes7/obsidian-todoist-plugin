import type { AddTaskAction } from "@/settings";

export type FileInfo = {
  name: string;
  path: string;
  vaultName: string;
};

const FileInfo = {
  mdFileUri: (file: FileInfo): string => {
    const vault = encodeURIComponent(file.vaultName);
    const filepath = encodeURIComponent(file.path);

    return `[${file.name}](obsidian://open?vault=${vault}&file=${filepath})`;
  },
} as const;

export type TaskInfo = {
  id: string;
  projectId: string;
  content: string;
};

export type BuildTaskContentOptions = {
  appendLink: boolean;
  wrapInParens: boolean;
};

/**
 * Builds task content, optionally appending an Obsidian file link.
 */
export const buildTaskContent = (
  content: string,
  file: FileInfo | undefined,
  options: BuildTaskContentOptions,
): string => {
  if (!options.appendLink || file === undefined) {
    return content;
  }

  const link = FileInfo.mdFileUri(file);
  if (options.wrapInParens) {
    return `${content} (${link})`;
  }
  return `${content} ${link}`;
};

/**
 * Builds a markdown link for copying a task to the clipboard.
 */
export const buildClipboardMarkdown = (
  task: TaskInfo,
  variant: Exclude<AddTaskAction, "add">,
): string => {
  let url: string;
  switch (variant) {
    case "add-copy-app":
      url = `todoist://task?id=${task.id}`;
      break;
    case "add-copy-web":
      url = `https://todoist.com/app/project/${task.projectId}/task/${task.id}`;
      break;
    default: {
      const _: never = variant;
      throw new Error(`Unknown variant: ${variant}`);
    }
  }
  return `[${task.content}](${url})`;
};
