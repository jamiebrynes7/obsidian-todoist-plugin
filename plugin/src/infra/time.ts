import {
  type CalendarDate,
  type ZonedDateTime,
  getLocalTimeZone,
  now as realNow,
  today as realToday,
} from "@internationalized/date";

export const today = (): CalendarDate => {
  return realToday(getLocalTimeZone());
};

export const now = (): ZonedDateTime => {
  return realNow(getLocalTimeZone());
};

export const timezone = (): string => {
  return getLocalTimeZone();
};
