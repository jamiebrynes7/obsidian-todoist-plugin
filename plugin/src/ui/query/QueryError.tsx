import { t } from "@/i18n";
import { ParsingError } from "@/query/parser";
import { Callout, type Contents } from "@/ui/components/callout";
import type React from "react";

type ErrorTree = string | { msg: string; children: ErrorTree[] };

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
      contents={getErrorMessages(error) ?? [i18n.unknownErrorMessage]}
    />
  );
};

const getErrorMessages = (error: unknown): Contents[] | undefined => {
  if (error instanceof ParsingError) {
    return error.messages;
  }

  if (error instanceof Error) {
    return [error.message];
  }

  return;
};
