import type { Vault } from "obsidian";

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
