export const sortingOptions = [
  "date",
  "dateAscending",
  "dateDescending",
  "priority",
];

export type SortingOption = typeof sortingOptions[number];

export function isSortingOption(value: string): value is SortingOption;
export function isSortingOption(value: any) {
  return sortingOptions.includes(value);
}

export type Query = {
  name: string;
  filter: string;
  autorefresh?: number;
  sorting?: SortingOption[];
  group: boolean;
};
