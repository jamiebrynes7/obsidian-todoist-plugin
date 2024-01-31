export enum SortingVariant {
  Priority,
  PriorityDescending,
  Date,
  DateDescending,
  Order
};

export type Query = {
  name: string;
  filter: string;
  autorefresh: number;
  sorting: SortingVariant[];
  group: boolean;
};
