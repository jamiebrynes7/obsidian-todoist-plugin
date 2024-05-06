import { QueryErrorKind } from "@/data";
import { Callout } from "@/ui/components/callout";
import React from "react";

const getErrorMessage = (kind: QueryErrorKind): string => {
  switch (kind) {
    case QueryErrorKind.BadRequest:
      return "The Todoist API has rejected the request. Please check the filter to ensure it is valid.";
    case QueryErrorKind.Unauthorized:
      return "The Todoist API request is missing or has the incorrect credentials. Please check the API token in the settings.";
    default:
      return "Unknown error occurred. Please check the Console in the Developer Tools window for more information";
  }
};

type Props = {
  kind: QueryErrorKind;
};

export const ErrorDisplay: React.FC<Props> = ({ kind }) => {
  const errorMessage = getErrorMessage(kind);

  return (
    <Callout
      className="todoist-query-error"
      title="Error"
      iconId="lucide-alert-triangle"
      contents={[errorMessage]}
    />
  );
};
