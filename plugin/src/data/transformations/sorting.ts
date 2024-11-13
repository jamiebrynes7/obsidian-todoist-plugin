import type { Task } from "@/data//task";
import { DueDateInfo } from "@/data/dueDateInfo";
import { SortingVariant } from "@/query/query";
import moment from "moment";

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

  const selfInfo = new DueDateInfo(self.due);
  const otherInfo = new DueDateInfo(other.due);

  if (selfInfo.hasDueDate() && !otherInfo.hasDueDate()) {
    return -1;
  }

  if (!selfInfo.hasDueDate() && otherInfo.hasDueDate()) {
    return 1;
  }

  if (!selfInfo.hasDueDate() && !otherInfo.hasDueDate()) {
    return 0;
  }

  const selfDate = selfInfo.moment();
  const otherDate = otherInfo.moment();

  if (selfDate === undefined || otherDate === undefined) {
    throw Error("Found unexpected missing moment date");
  }

  // Then lets check if we are the same day, if not
  // sort just based on the day.
  if (!selfDate.isSame(otherDate, "day")) {
    return selfDate.isBefore(otherDate, "day") ? -1 : 1;
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

  return selfDate.isBefore(otherDate) ? -1 : 1;
}

function compareTaskDateAdded<T extends Task>(self: T, other: T): number {
  const selfDate = moment(self.createdAt);
  const otherDate = moment(other.createdAt);

  if (selfDate === otherDate) {
    return 0;
  }

  return selfDate.isBefore(otherDate) ? -1 : 1;
}
