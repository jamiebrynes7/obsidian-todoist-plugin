import type React from "react";

import { t } from "@/i18n";
import { Callout } from "@/ui/components/callout";

type Props = {
  message?: string;
};

export const EmptyDisplay: React.FC<Props> = ({ message }) => {
  const i18n = t().query.displays.empty;
  const displayMessage = message ?? i18n.label;

  return <Callout className="todoist-no-tasks" title={displayMessage} iconId="info" />;
};
