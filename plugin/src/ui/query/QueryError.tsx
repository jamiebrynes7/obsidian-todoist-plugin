import { t } from "@/i18n";
import { Callout } from "@/ui/components/callout";
import React from "react";

type Props = {
  error: unknown;
};

export const QueryError: React.FC<Props> = ({ error }) => {
  const i18n = t().query.displays.parsingError;

  return (
    <Callout
      className="todoist-query-error"
      title={i18n.header}
      iconId="lucide-alert-triangle"
      contents={[getErrorMessage(error) ?? i18n.unknownErrorMessage]}
    />
  );
};

const getErrorMessage = (error: unknown): string | undefined => {
  if (error instanceof Error) {
    return error.message;
  }

  return;
};
