import type { SecretStorage, Vault } from "obsidian";

import type { TokenStorageSetting } from "@/settings";
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

  read(): Promise<string | null> {
    const settings = useSettingsStore.getState();
    return this.readFromStorage(settings.tokenStorage);
  }

  write(token: string): Promise<void> {
    const settings = useSettingsStore.getState();
    return this.writeToStorage(token, settings.tokenStorage);
  }

  async migrateStorage(from: TokenStorageSetting, to: TokenStorageSetting): Promise<void> {
    if (from === to) {
      return;
    }

    const token = await this.readFromStorage(from);
    if (token === null) {
      return;
    }

    await this.writeToStorage(token, to);
    await this.cleanupStorage(from);
  }

  private async readFromStorage(storage: TokenStorageSetting): Promise<string | null> {
    switch (storage) {
      case "file": {
        const exists = await this.vault.adapter.exists(this.path);
        if (!exists) {
          return null;
        }

        const value = await this.vault.adapter.read(this.path);
        return value === "" ? null : value;
      }
      case "secrets": {
        const secretId = useSettingsStore.getState().apiTokenSecretId;
        const value = this.secrets.getSecret(secretId);
        return value === "" ? null : value;
      }
      default: {
        const _: never = storage;
        throw new Error("Unknown token storage setting");
      }
    }
  }

  private async writeToStorage(token: string, storage: TokenStorageSetting): Promise<void> {
    switch (storage) {
      case "file":
        await this.vault.adapter.write(this.path, token);
        return;
      case "secrets": {
        const secretId = useSettingsStore.getState().apiTokenSecretId;
        this.secrets.setSecret(secretId, token);
        return;
      }
      default: {
        const _: never = storage;
        throw new Error("Unknown token storage setting");
      }
    }
  }

  private async cleanupStorage(storage: TokenStorageSetting): Promise<void> {
    switch (storage) {
      case "file": {
        const exists = await this.vault.adapter.exists(this.path);
        if (exists) {
          await this.vault.adapter.remove(this.path);
        }
        return;
      }
      case "secrets": {
        const secretId = useSettingsStore.getState().apiTokenSecretId;
        this.secrets.setSecret(secretId, "");
        return;
      }
      default: {
        const _: never = storage;
        throw new Error("Unknown token storage setting");
      }
    }
  }
}
