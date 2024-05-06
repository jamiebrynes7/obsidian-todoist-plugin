import { Callout } from "@/ui/components/callout";
import React from "react";

type Props = {
  error: unknown;
};

export const QueryError: React.FC<Props> = ({ error }) => {
  return (
    <Callout
      className="todoist-query-error"
      title="Error: Query parsing failed"
      iconId="lucide-alert-triangle"
      contents={[getErrorMessage(error)]}
    />
  );
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error occurred. Please check the Console in the Developer Tools window for more information";
};
