import { en } from "@/i18n/langs/en";
import { nl } from "@/i18n/langs/nl";
import type { Translations } from "@/i18n/translation";
import { DeepPartial, type DeepReadonly } from "@/utils/types";

// Global language instance. Expect this to be set once at startup based off
// the language value in the root HTML element inside Obsidian.
let language = "en";
let _t: DeepReadonly<Translations> = en as DeepReadonly<Translations>;

export const setLanguage = (lang: string) => {
  language = lang;
  _t = DeepPartial.merge(en, registry[lang] ?? {}) as DeepReadonly<Translations>;
};

export const t = () => {
  return _t;
};

type TranslationStatus = { kind: "complete" | "missing" | "partial" };

export const getTranslationStatus = (): TranslationStatus => {
  if (language === "en") {
    return { kind: "complete" };
  }
  if (!(language in registry)) {
    return { kind: "missing" };
  }

  // Check if all keys are present recursively.
  const translations = registry[language];
  if (DeepPartial.isComplete(en, translations)) {
    return { kind: "complete" };
  }

  return { kind: "partial" };
};

/*
 * Register new translations here. They do not need to be complete to be
 * used. If keys are missing, they will be filled in with the default (en).
 *
 * 1. Identify the language code. This can be found in the root HTML element
 *    inside Obsidian.
 * 2. Create a new file in the langs/ directory with the language code as the
 *    file name. E.g. - `langs/fr.ts`.
 * 3. Copy the template below and fill in the missing keys. Make sure to replace
 *    the $langCode with your language code.

        import type { Translations } from "@/i18n/translation";
        import type { DeepPartial } from "@/utils/types";

        export const $langCode: DeepPartial<Translations> = {};

 * 4. Register the language in the registry below. The key should be the lang code.
      The value should be the exported object from step 3.
 */

// Register new languages here. The key should be the language key as seen
// in the root of the HTML document (e.g. "fr", "es", etc.).
const registry: Record<string, DeepPartial<Translations>> = {
  nl: nl,
};
