import { Result } from "./result";

export default interface IQuery {
  name: string;
  filter: string;
  autorefresh?: number;
  sorting?: string[];
  group: boolean;
}

const possibleSortingOptions = ["date", "priority"];

export function parseQuery(query: any): Result<IQuery, Error> {
  if (!query.hasOwnProperty("name")) {
    return Result.Err(new Error("Missing 'name' field in query."));
  }

  if (!query.hasOwnProperty("filter")) {
    return Result.Err(new Error("Missing 'filter' field in query"));
  }

  if (
    query.hasOwnProperty("autorefresh") &&
    (isNaN(query.autorefresh) || (query.autorefresh as number) < 0)
  ) {
    return Result.Err(
      new Error("'autorefresh' field must be a positive number.")
    );
  }

  if (query.hasOwnProperty("sorting")) {
    if (!Array.isArray(query.sorting)) {
      return Result.Err(
        new Error(
          "'sorting' field must be an array of strings within the set ['date', 'priority']."
        )
      );
    }

    const sorting = query.sorting as any[];

    for (const element of sorting) {
      if (
        !(typeof element == "string") ||
        possibleSortingOptions.indexOf(element as string) == -1
      ) {
        return Result.Err(
          new Error(
            "'sorting' field must be an array of strings within the set ['date', 'priority']."
          )
        );
      }
    }
  }

  if (query.hasOwnProperty("group") && typeof query.group != "boolean") {
    return Result.Err(new Error("'group' field must be a boolean."));
  }

  return Result.Ok(query as IQuery);
}
