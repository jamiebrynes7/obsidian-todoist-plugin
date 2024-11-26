import type { DueDate } from "@/data/dueDate";
import { t } from "@/i18n";
import { locale } from "@/infra/locale";
import { timezone } from "@/infra/time";

const formatStyles: Record<string, Intl.DateTimeFormatOptions> = {
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

const formatterCache: Record<string, Intl.DateTimeFormat> = {};

const getFormatter = (style: string): Intl.DateTimeFormat => {
  if (formatterCache[style]) {
    return formatterCache[style];
  }

  formatterCache[style] = new Intl.DateTimeFormat(locale(), {
    timeZone: timezone(),
    ...formatStyles[style],
  });
  return formatterCache[style];
};

export const formatDueDate = (dueDate: DueDate): string => {
  const date = formatDate(dueDate);

  if (dueDate.hasTime()) {
    const i18n = t().dates;
    const time = dueDate.format(getFormatter("time"));

    return i18n.dateTime(date, time);
  }

  return date;
};

const formatDate = (dueDate: DueDate): string => {
  const i18n = t().dates;

  if (dueDate.isToday()) {
    return i18n.today;
  }

  if (dueDate.isTomorrow()) {
    return i18n.tomorrow;
  }

  if (dueDate.isYesterday()) {
    return i18n.yesterday;
  }

  if (dueDate.isInLastWeek()) {
    return i18n.lastWeekday(dueDate.format(getFormatter("weekday")));
  }

  if (dueDate.isInNextWeek()) {
    return dueDate.format(getFormatter("weekday"));
  }

  if (!dueDate.isCurrentYear()) {
    return dueDate.format(getFormatter("dateWithYear"));
  }

  return dueDate.format(getFormatter("date"));
};

export const formatAsHeader = (dueDate: DueDate): string => {
  const formatParts: string[] = [
    dueDate.format(getFormatter("date")),
    dueDate.format(getFormatter("weekday")),
  ];

  const i18n = t().dates;

  if (dueDate.isToday()) {
    formatParts.push(i18n.today);
  } else if (dueDate.isTomorrow()) {
    formatParts.push(i18n.tomorrow);
  }

  return formatParts.join(" ‧ ");
};
