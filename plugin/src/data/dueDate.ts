import {
  CalendarDate,
  fromDate,
  parseAbsolute,
  parseDate,
  parseDateTime,
  ZonedDateTime,
} from "@internationalized/date";

import type { DueDate as ApiDueDate } from "@/api/domain/dueDate";
import type { Duration as ApiDuration } from "@/api/domain/task";
import { t } from "@/i18n";
import { locale } from "@/infra/locale";
import { now, timezone, today } from "@/infra/time";

export type DateInfo = {
  raw: Date;
  hasTime: boolean;
  isOverdue: boolean;
  isCurrentYear: boolean;
  flag: "today" | "tomorrow" | "nextWeek" | "yesterday" | "lastWeek" | undefined;
};

export type DueDate = {
  start: DateInfo;
  end: DateInfo | undefined;
};

const parseDueDate = (dueDate: ApiDueDate, duration?: ApiDuration): DueDate => {
  let start: ZonedDateTime | CalendarDate;
  if (dueDate.datetime !== undefined) {
    // If the datetime comes with a trailing Z, then the task has a fixed timezone. We repsect
    // this and convert it into their local timezone. Otherwise, it is a floating timezone and we
    // simply parse it as a local datetime.
    if (dueDate.datetime.endsWith("Z")) {
      start = parseAbsolute(dueDate.datetime, timezone());
    } else {
      start = fromDate(parseDateTime(dueDate.datetime).toDate(timezone()), timezone());
    }
  } else {
    start = parseDate(dueDate.date);
  }

  let end: ZonedDateTime | undefined;
  if (duration !== undefined && start instanceof ZonedDateTime) {
    switch (duration.unit) {
      case "day":
        end = start.add({
          days: duration.amount,
        });
        break;
      case "minute":
        end = start.add({
          minutes: duration.amount,
        });
        break;
      default: {
        const _: never = duration.unit;
      }
    }
  }

  return {
    start: calculateDateInfo(start),
    end: end !== undefined ? calculateDateInfo(end) : undefined,
  };
};

const calculateDateInfo = (datetime: ZonedDateTime | CalendarDate): DateInfo => {
  let hasTime = false;
  let date: CalendarDate;
  if (datetime instanceof ZonedDateTime) {
    date = new CalendarDate(datetime.year, datetime.month, datetime.day);
    hasTime = true;
  } else {
    date = datetime;
  }

  let flag: DateInfo["flag"];
  if (date.compare(today()) === 0) {
    flag = "today";
  } else if (date.compare(today().add({ days: 1 })) === 0) {
    flag = "tomorrow";
  } else if (date.compare(today().add({ days: -1 })) === 0) {
    flag = "yesterday";
  } else if (date.compare(today().add({ days: -7 })) >= 0 && date.compare(today()) < 0) {
    flag = "lastWeek";
  } else if (date.compare(today().add({ days: 7 })) <= 0 && date.compare(today()) > 0) {
    flag = "nextWeek";
  }

  return {
    raw: datetime.toDate(timezone()),
    hasTime,
    isOverdue: datetime.compare(hasTime ? now() : today()) < 0,
    isCurrentYear: datetime.year === today().year,
    flag,
  };
};

const getFormatter: (style: string) => Intl.DateTimeFormat = (() => {
  const styles: Record<string, Intl.DateTimeFormatOptions> = {
    time: {
      timeStyle: "short",
    },
    weekday: {
      weekday: "long",
    },
    date: {
      month: "short",
      day: "numeric",
    },
    dateWithYear: {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  };

  const cache: Record<string, Intl.DateTimeFormat> = {};

  return (style: string): Intl.DateTimeFormat => {
    if (cache[style]) {
      return cache[style];
    }

    cache[style] = new Intl.DateTimeFormat(locale(), {
      timeZone: timezone(),
      ...styles[style],
    });
    return cache[style];
  };
})();

const formatDueDate = (due: DueDate): string => {
  const date = formatDate(due.start);

  if (!due.start.hasTime) {
    return date;
  }

  const i18n = t().dates;
  const time = getFormatter("time").format(due.start.raw);

  if (due.end === undefined) {
    return i18n.dateTime(date, time);
  }

  const endTime = getFormatter("time").format(due.end.raw);
  if (isSameDay(due.start.raw, due.end.raw)) {
    return i18n.dateTimeDuration(date, time, endTime);
  }

  const endDate = formatDate(due.end);
  return i18n.dateTimeDurationDifferentDays(date, time, endDate, endTime);
};

const formatDate = (info: DateInfo): string => {
  const i18n = t().dates;

  switch (info.flag) {
    case "today":
      return i18n.today;
    case "tomorrow":
      return i18n.tomorrow;
    case "yesterday":
      return i18n.yesterday;
    case "lastWeek":
      return i18n.lastWeekday(getFormatter("weekday").format(info.raw));
    case "nextWeek":
      return getFormatter("weekday").format(info.raw);
  }

  if (!info.isCurrentYear) {
    return getFormatter("dateWithYear").format(info.raw);
  }

  return getFormatter("date").format(info.raw);
};

const formatDueDateHeader = (due: DueDate): string => {
  const parts = [
    getFormatter("date").format(due.start.raw),
    getFormatter("weekday").format(due.start.raw),
  ];

  const i18n = t().dates;

  switch (due.start.flag) {
    case "today":
      parts.push(i18n.today);
      break;
    case "tomorrow":
      parts.push(i18n.tomorrow);
      break;
  }

  return parts.join(" ‧ ");
};

export const DueDate = {
  parse: parseDueDate,
  format: formatDueDate,
  formatHeader: formatDueDateHeader,
};

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
