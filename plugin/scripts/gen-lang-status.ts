import { registry } from "../src/i18n";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const countKeys = (obj: Record<string, unknown>): number => {
  let count = 0;

  for (const key in obj) {
    count++;
    const value = obj[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      count += countKeys(value as Record<string, unknown>);
    }
  }

  return count;
};

type TranslationStatus = {
  name: string;
  code: string;
  completed: number;
};

const tabulateTranslations = (reg: typeof registry): TranslationStatus[] => {
  const result: TranslationStatus[] = [];

  for (const definition of Object.values(reg)) {
    const completed = countKeys(definition.translations);

    result.push({
      name: definition.name,
      code: definition.code,
      completed,
    });
  }

  return result;
};

type Output = {
  total: number;
  statuses: TranslationStatus[];
};

const generateOutput = () => {
  const total = countKeys(registry.en.translations);
  const statuses = tabulateTranslations(registry);

  const result: Output = {
    total,
    statuses,
  };

  const outputFilePath = join(__dirname, "..", "..", "docs", "docs", "translation-status.json");
  writeFileSync(outputFilePath, JSON.stringify(result, null, 2));
};

generateOutput();
