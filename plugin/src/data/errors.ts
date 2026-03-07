import { TodoistApiError } from "@/api";
import { StatusCode, StatusCodes } from "@/api/fetcher";

export enum QueryErrorKind {
  BadRequest = 0,
  Unauthorized = 1,
  Forbidden = 2,
  ServerError = 3,
  Unknown = 4,
}

export function mapApiError(error: unknown): QueryErrorKind {
  if (error instanceof TodoistApiError) {
    if (error.statusCode === StatusCodes.BadRequest) {
      return QueryErrorKind.BadRequest;
    }
    if (error.statusCode === StatusCodes.Unauthorized) {
      return QueryErrorKind.Unauthorized;
    }
    if (error.statusCode === StatusCodes.Forbidden) {
      return QueryErrorKind.Forbidden;
    }
    if (StatusCode.isServerError(error.statusCode)) {
      return QueryErrorKind.ServerError;
    }
  }

  return QueryErrorKind.Unknown;
}
