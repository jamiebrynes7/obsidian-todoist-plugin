import { Callout } from "@/ui/components/callout";
import React from "react";

export const EmptyDisplay: React.FC = () => {
  return <Callout className="todoist-no-tasks" title="The query returned no tasks" iconId="info" />;
};
