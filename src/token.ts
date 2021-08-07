import { Platform } from "obsidian";

export function getTokenPath(): string {
  let pathSep = "/";

  // If we are on windows, use backslashes.
  if (Platform.isDesktop && !Platform.isMacOS) {
    pathSep = "\\";
  }

  return `.obsidian${pathSep}todoist-token`;
}
