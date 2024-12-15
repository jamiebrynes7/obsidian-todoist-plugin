# Translations

Before getting started, you should ensure you read the general [contribution guide](./general). This will ensure that you have a working build environment and are ready to go!

## Architecture

It can be useful to understand how the translation system works in this plugin. At startup, the plugin will set the language based on the `lang` attribute in the root `html` element. This ensures that it follows the language set in the general Obsidian settings. A consequence of this is that we are restricted to the [languages supported by Obsidian](https://github.com/obsidianmd/obsidian-translations#existing-languages).

The translations are effectively a large key-value store. You can see all of the keys and the structure in `plugin/src/i18n/translations.ts`. The location of the translation phrase (or function) in the `Translations` type should give a suggestion as to where it is used. For example, `translations.settings.autoRefresh.header` refers to the header of the auto-refresh settings section.

The plugin can consume the translations by calling the `t()` function exported from `i18n` to get the currently resolved translations. This object is marked as `readonly` so that it can't be modified. For example:

```ts
import { t } from "@/i18n";

const i18n = t();

const getSettingsHeader = () => {
  return i18n.settings.general.header;
};
```

If a language does not have a translation for a particular key, the plugin will fall back to the English translation.

## Adding a new language

There is a guide in `plugin/src/i18n/index.ts` that explains how to add a new language. This is repeated here for convenience:

1. Identify the language code for the language you want to add. You can find this by searching for the language in the [Obsidian translations repo](https://github.com/obsidianmd/obsidian-translations).
2. Create a file in the `plugin/src/i18n/langs` directory with language code as the filename. For example, if you were to add a translation for French, you would create `plugin/src/i18n/langs/fr.ts`.
3. Copy the template below into the new file. Make sure to replace $langCode with the language code:

   ```ts
   import type { Translations } from "@/i18n/translation";
   import type { DeepPartial } from "@/utils/types";

   export const $langCode: DeepPartial<Translations> = {};
   ```

4. Register the language in the registry at the bottom of `plugin/src/i18n/index.ts`. The key should be the language code and the value should be the object exported in the previous step. You will need to add an import for the new file. For example:

   ```ts
   // plugin/src/i18n/index.ts
   import { fr } from "@/i18n/langs/fr";

   // A bunch of things you don't need to worry about...

   const registry: Record<string, DeepPartial<Translations>> = {
     fr: fr,
   };
   ```

5. Proceed to [adding translated phrases](#adding-translated-phrases).

## Adding translated phrases

In order to add translated phrases, you will first need to identify the key for the phrase. The easiest way to do this is to search for the English phrase in the `plugin/src/i18n/langs/en.ts` file.

For example, if I wanted to translate the phrase "Rendering" in the settings, I would search for "Rendering" in the `plugin/src/i18n/langs/en.ts` file. I would find that the key is `settings.rendering.header`.

Then, open the file for the language you want to add the translation to. For example, if I wanted to add the translation to French, I would open `plugin/src/i18n/langs/fr.ts`. If the language doesn't exist, please see [the section above](#adding-a-new-language).

Then I would ld add the translation to the object. You may need to create the object path if it doesn't exist. For example, let's assume that there were no translations for French, I would need to add the following structure:

```ts
export const fr: DeepPartial<Translations> = {
  settings: {
    rendering: {
      header: "translation of 'Rendering'",
    },
  },
};
```
