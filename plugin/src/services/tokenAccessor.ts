import type { SecretStorage, Vault } from "obsidian";

import { useSettingsStore } from "@/settings";

export class VaultTokenAccessor {
  private readonly secrets: SecretStorage;
  private readonly vault: Vault;
  private readonly path: string;

  constructor(vault: Vault, secrets: SecretStorage) {
    this.secrets = secrets;
    this.vault = vault;
    this.path = `${vault.configDir}/todoist-token`;
  }

  read(): string | null {
    const secretId = useSettingsStore.getState().apiTokenSecretId;
    return this.secrets.getSecret(secretId);
  }

  write(token: string) {
    const secretId = useSettingsStore.getState().apiTokenSecretId;
    this.secrets.setSecret(secretId, token);
  }

  async migrateToSecrets(): Promise<void> {
    const tokenExists = await this.vault.adapter.exists(this.path);
    if (!tokenExists) {
      return;
    }

    const token = await this.vault.adapter.read(this.path);
    const secretId = useSettingsStore.getState().apiTokenSecretId;

    this.secrets.setSecret(secretId, token);
    await this.vault.adapter.remove(this.path);
  }
}
