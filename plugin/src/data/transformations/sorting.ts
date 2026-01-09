import { parseAbsoluteToLocal } from "@internationalized/date";

import type { Task } from "@/data//task";
import { DueDate } from "@/data/dueDate";
import type { SortingKey } from "@/query/schema/sorting";

export function sortTasks<T extends Task>(tasks: T[], sort: SortingKey[]) {
  tasks.sort((first, second) => {
    for (const sorting of sort) {
      const cmp = compareTask(first, second, sorting);
      if (cmp === 0) {
        continue;
      }

      return cmp;
    }

    return 0;
  });
}

// Result of "LT zero" means that self is before other,
// Result of '0' means that they are equal
// Result of "GT zero" means that self is after other
function compareTask<T extends Task>(self: T, other: T, sorting: SortingKey): number {
  switch (sorting) {
    case "priority":
      // Note that priority in the API is reversed to that of in the app.
      return other.priority - self.priority;
    case "priorityAscending":
      return self.priority - other.priority;
    case "dateAscending":
      return compareTaskDate(self, other);
    case "dateDescending":
      return -compareTaskDate(self, other);
    case "order":
      return self.order - other.order;
    case "dateAddedAscending":
      return compareTaskDateAdded(self, other);
    case "dateAddedDescending":
      return -compareTaskDateAdded(self, other);
    case "alphabeticalAscending":
      return compareTaskAlphabetical(self, other);
    case "alphabeticalDescending":
      return -compareTaskAlphabetical(self, other);
    default:
      throw new Error(`Unexpected sorting type: '${sorting}'`);
  }
}

function compareTaskDate<T extends Task>(self: T, other: T): number {
  // We will sort items using the following algorithm:
  // 1. Any items without a due date are always after those with.
  // 2. Any items on the same day, but without time are always sorted after those with time.

  if (self.due === undefined) {
    if (other.due === undefined) {
      return 0;
    }

    // Self doesn't have date, but other does
    return 1;
  }

  // Self has date, but other doesn't
  if (other.due === undefined) {
    return -1;
  }

  const selfInfo = DueDate.parse(self.due).start;
  const otherInfo = DueDate.parse(other.due).start;

  // Then lets check if we are the same day, if not
  // sort just based on the day.
  if (!isSameDay(selfInfo.raw, otherInfo.raw)) {
    return selfInfo.raw < otherInfo.raw ? -1 : 1;
  }

  if (selfInfo.hasTime && !otherInfo.hasTime) {
    return -1;
  }

  if (!selfInfo.hasTime && otherInfo.hasTime) {
    return 1;
  }

  if (!selfInfo.hasTime && !otherInfo.hasTime) {
    return 0;
  }

  return selfInfo.raw < otherInfo.raw ? -1 : 1;
}

function compareTaskDateAdded<T extends Task>(self: T, other: T): number {
  const selfDate = parseAbsoluteToLocal(self.createdAt);
  const otherDate = parseAbsoluteToLocal(other.createdAt);

  return selfDate.compare(otherDate) < 0 ? -1 : 1;
}

function compareTaskAlphabetical<T extends Task>(self: T, other: T): number {
  return self.content.localeCompare(other.content, undefined, { sensitivity: "base" });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
