import { EmptyDisplay } from "@/ui/query/displays/EmptyDisplay";
import { ErrorDisplay } from "@/ui/query/displays/ErrorDisplay";
import { GroupedDisplay } from "@/ui/query/displays/GroupedDisplay";
import { ListDisplay } from "@/ui/query/displays/ListDisplay";
import { NotReadyDisplay } from "@/ui/query/displays/NotReadyDisplay";

export const Displays = {
  Error: ErrorDisplay,
  Empty: EmptyDisplay,
  List: ListDisplay,
  Grouped: GroupedDisplay,
  NotReady: NotReadyDisplay,
};
