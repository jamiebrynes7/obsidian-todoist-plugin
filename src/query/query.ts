export type Sort =
  "priority" | "priorityAscending"
  | "priorityDescending"
  | "date" | "dateAscending"
  | "dateDescending"
  | "order";

// This should be kept in sync with the above, not sure how to enforce
// exhaustiveness.
export const sortingVariants: Sort[] = [
  "priority",
  "priorityAscending",
  "priorityDescending",
  "date",
  "dateAscending",
  "dateDescending",
  "order",
];

export function isSortingOption(value: string): value is Sort;
export function isSortingOption(value: any) {
  return sortingVariants.includes(value);
}

export type Query = {
  name: string;
  filter: string;
  autorefresh?: number;
  sorting?: Sort[];
  group: boolean;
};
