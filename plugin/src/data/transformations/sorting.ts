import type { Task } from "@/data//task";
import { DueDate } from "@/data/dueDate";
import { SortingVariant } from "@/query/query";
import { parseAbsoluteToLocal } from "@internationalized/date";

export function sortTasks<T extends Task>(tasks: T[], sort: SortingVariant[]) {
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
function compareTask<T extends Task>(self: T, other: T, sorting: SortingVariant): number {
  switch (sorting) {
    case SortingVariant.Priority:
      // Note that priority in the API is reversed to that of in the app.
      return other.priority - self.priority;
    case SortingVariant.PriorityAscending:
      return self.priority - other.priority;
    case SortingVariant.Date:
      return compareTaskDate(self, other);
    case SortingVariant.DateDescending:
      return -compareTaskDate(self, other);
    case SortingVariant.Order:
      return self.order - other.order;
    case SortingVariant.DateAdded:
      return compareTaskDateAdded(self, other);
    case SortingVariant.DateAddedDescending:
      return -compareTaskDateAdded(self, other);
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

  const selfInfo = new DueDate(self.due);
  const otherInfo = new DueDate(other.due);

  const dateCmp = selfInfo.compareDate(otherInfo);

  // Then lets check if we are the same day, if not
  // sort just based on the day.
  if (dateCmp !== 0) {
    return dateCmp;
  }

  if (selfInfo.hasTime() && !otherInfo.hasTime()) {
    return -1;
  }

  if (!selfInfo.hasTime() && otherInfo.hasTime()) {
    return 1;
  }

  if (!selfInfo.hasTime() && !otherInfo.hasTime()) {
    return 0;
  }

  return selfInfo.compareDateTime(otherInfo);
}

function compareTaskDateAdded<T extends Task>(self: T, other: T): number {
  const selfDate = parseAbsoluteToLocal(self.createdAt);
  const otherDate = parseAbsoluteToLocal(other.createdAt);

  return selfDate.compare(otherDate) < 0 ? -1 : 1;
}
