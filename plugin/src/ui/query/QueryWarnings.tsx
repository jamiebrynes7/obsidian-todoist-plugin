import type { QueryWarning } from "@/query/parser";
import { Callout } from "@/ui/components/callout";
import React from "react";

type Props = {
  warnings: QueryWarning[];
};

export const QueryWarnings: React.FC<Props> = ({ warnings }) => {
  if (warnings.length === 0) {
    return <></>;
  }

  return (
    <Callout
      className="todoist-query-warnings"
      title="Warnings"
      iconId="lucide-alert-triangle"
      contents={warnings}
    />
  );
};
