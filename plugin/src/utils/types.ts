export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export type DeepReadonly<T> = T extends Function
  ? T
  : {
      readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
    };

export namespace DeepPartial {
  export function merge<T extends object>(base: T, partial: DeepPartial<T>): T {
    const merged = { ...base };
    for (const key in partial) {
      if (
        typeof partial[key] === "object" &&
        partial[key] !== null &&
        typeof base[key] === "object" &&
        base[key] !== null
      ) {
        // @ts-ignore: we know that the types make sense here
        merged[key] = merge(base[key], partial[key]);
      } else if (partial[key] !== undefined) {
        merged[key] = partial[key] as T[typeof key];
      }
    }
    return merged;
  }

  export function isComplete<T extends object>(obj: T, partial: DeepPartial<T>): boolean {
    for (const key in obj) {
      if (!(key in partial)) {
        return false;
      }

      if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        typeof partial[key] === "object" &&
        partial[key] !== null
      ) {
        if (!isComplete(obj[key] as object, partial[key] as DeepPartial<object>)) {
          return false;
        }
      } else if (partial[key] === undefined) {
        return false;
      }
    }

    return true;
  }
}
