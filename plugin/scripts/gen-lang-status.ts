import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { registry } from "../src/i18n";

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

const totalKeys = countKeys(registry.en.translations);

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const result: any[] = [];

for (const definition of Object.values(registry)) {
  const keys = countKeys(definition.translations);
  const missing = totalKeys - keys;
  const percent = Math.round((keys / totalKeys) * 100);

  result.push({
    name: definition.name,
    code: definition.code,
    completed: keys,
    missing,
    percent,
  });
}

const outputFilePath = join(__dirname, "..", "..", "docs", "docs", "translation-status.json");
writeFileSync(outputFilePath, JSON.stringify(result, null, 2));
