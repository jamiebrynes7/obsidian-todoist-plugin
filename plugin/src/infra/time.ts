import {
  type CalendarDate,
  getLocalTimeZone,
  now as realNow,
  today as realToday,
  type ZonedDateTime,
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

const millisInSecond = 1000;
export const secondsToMillis = (seconds: number): number => {
  return seconds * millisInSecond;
};
