import { QueryErrorKind } from "@/data";
import { t } from "@/i18n";
import type { Translations } from "@/i18n/translation";
import { Callout } from "@/ui/components/callout";
import type React from "react";

const getErrorMessage = (
  kind: QueryErrorKind,
  i18n: Translations["query"]["displays"]["error"],
): string => {
  switch (kind) {
    case QueryErrorKind.BadRequest:
      return i18n.badRequest;
    case QueryErrorKind.Unauthorized:
    case QueryErrorKind.Forbidden:
      return i18n.unauthorized;
    case QueryErrorKind.ServerError:
      return i18n.serverError;
    default:
      return i18n.unknown;
  }
};

type Props = {
  kind: QueryErrorKind;
};

export const ErrorDisplay: React.FC<Props> = ({ kind }) => {
  const i18n = t().query.displays.error;

  const errorMessage = getErrorMessage(kind, i18n);

  return (
    <Callout
      className="todoist-query-error"
      title={i18n.header}
      iconId="lucide-alert-triangle"
      contents={[errorMessage]}
    />
  );
};
