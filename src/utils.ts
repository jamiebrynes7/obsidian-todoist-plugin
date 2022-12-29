export function isPositiveInteger(str: string): boolean {
    const num = toInt(str);
    return num != Infinity && String(num) === str && num > 0;
}

export function toInt(str: string): number {
    return Math.floor(Number(str));
}

export class ExtendedMap<K, V> extends Map<K, V> {
    get_or_default(key: K, defaultValue: V): V {
        if (this.has(key)) {
            return this.get(key);
        }

        return defaultValue;
    }

    get_or_maybe_insert(key: K, newValue: () => V | null): V {
        if (this.has(key)) {
            return this.get(key);
        }

        const value = newValue();
        if (value) {
            this.set(key, value);
        }

        return value;
    }
}

export function notification(contents: string, timeoutMs: number) {
    const element = document.createElement("div");
    element.innerText = contents;
    element.classList.add("notice");
    document.body.appendChild(element);

    setTimeout(() => {
        element.classList.add("mod-disappearing");
        setTimeout(() => {
            element.remove();
        }, 1e3);
    }, timeoutMs);
}

export const APP_CONTEXT_KEY = "obsidian_app";
