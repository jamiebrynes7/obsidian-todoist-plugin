import type { Vault } from "obsidian";

export function getTokenPath(vault: Vault): string {
  return `${vault.configDir}/todoist-token`;
}
