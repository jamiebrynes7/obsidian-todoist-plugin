import type { Vault } from "obsidian";
import { TodoistApiClient } from "./api";
import { ObsidianFetcher } from "./api/fetcher";

export class VaultTokenAccessor {
  private readonly vault: Vault;
  private readonly path: string;
  constructor(vault: Vault) {
    this.vault = vault;
    this.path = `${vault.configDir}/todoist-token`;
  }

  exists(): Promise<boolean> {
    return this.vault.adapter.exists(this.path);
  }

  read(): Promise<string> {
    return this.vault.adapter.read(this.path);
  }

  write(token: string): Promise<void> {
    return this.vault.adapter.write(this.path, token);
  }
}

export namespace TokenValidation {
  export type Result =
    | { kind: "none" }
    | { kind: "error"; message: string }
    | { kind: "in-progress" }
    | { kind: "success" };

  export const validate = async (token: string, tester: TokenTester): Promise<Result> => {
    if (token.length === 0) {
      return { kind: "error", message: "API token must not be empty" };
    }

    const [isValid, _] = await Promise.all([
      tester(token),
      new Promise<void>((res) => setTimeout(() => res(), 1000)),
    ]);

    if (!isValid) {
      return {
        kind: "error",
        message: "Oops! Todoist does not recognize this token. Please double check and try again!",
      };
    }

    return { kind: "success" };
  };

  export type TokenTester = (token: string) => Promise<boolean>;

  export const DefaultTester: TokenTester = async (token: string): Promise<boolean> => {
    const api = new TodoistApiClient(token, new ObsidianFetcher());

    try {
      await api.getProjects();
      return true;
    } catch (e) {
      return false;
    }
  };
}
