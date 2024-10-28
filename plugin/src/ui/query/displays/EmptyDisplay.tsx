import { t } from "@/i18n";
import { Callout } from "@/ui/components/callout";
import type React from "react";

export const EmptyDisplay: React.FC = () => {
  const i18n = t().query.displays.empty;
  return <Callout className="todoist-no-tasks" title={i18n.label} iconId="info" />;
};
