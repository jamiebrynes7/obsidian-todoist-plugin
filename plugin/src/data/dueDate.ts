import type { DueDate as ApiDueDate } from "@/api/domain/dueDate";
import { t } from "@/i18n";
import { locale } from "@/infra/locale";
import { now, timezone, today } from "@/infra/time";
import {
  CalendarDate,
  ZonedDateTime,
  fromDate,
  parseAbsolute,
  parseDate,
  parseDateTime,
} from "@internationalized/date";

export type DateInfo = {
  raw: Date;
  hasTime: boolean;
  isOverdue: boolean;
  isCurrentYear: boolean;
  flag: "today" | "tomorrow" | "nextWeek" | "yesterday" | "lastWeek" | undefined;
};

export type DueDate = {
  start: DateInfo;
  end: undefined;
};

const parseDueDate = (dueDate: ApiDueDate): DueDate => {
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

  return {
    start: calculateDateInfo(start),
    end: undefined,
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

  let flag: DateInfo["flag"] = undefined;
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

  if (due.start.hasTime) {
    const i18n = t().dates;
    const time = getFormatter("time").format(due.start.raw);

    return i18n.dateTime(date, time);
  }

  return date;
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
