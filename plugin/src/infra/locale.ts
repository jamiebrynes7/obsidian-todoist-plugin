export const locale = (): string => {
  return new Intl.DateTimeFormat(undefined).resolvedOptions().locale;
};
