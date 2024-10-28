import { t } from "@/i18n";
import type { QueryWarning } from "@/query/parser";
import { Callout } from "@/ui/components/callout";
import type React from "react";

type Props = {
  warnings: QueryWarning[];
};

export const QueryWarnings: React.FC<Props> = ({ warnings }) => {
  if (warnings.length === 0) {
    return <></>;
  }

  const i18n = t().query.warning;

  return (
    <Callout
      className="todoist-query-warnings"
      title={i18n.header}
      iconId="lucide-alert-triangle"
      contents={warnings}
    />
  );
};
