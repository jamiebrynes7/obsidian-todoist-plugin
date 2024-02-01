export enum SortingVariant {
  Priority,
  PriorityDescending,
  Date,
  DateDescending,
  Order,
  DateAdded,
  DateAddedDescending,
};

export enum ShowMetadataVariant {
  Due,
  Project,
  Labels,
  Description,
}

export type Query = {
  name: string;
  filter: string;
  autorefresh: number;
  sorting: SortingVariant[];
  show: Set<ShowMetadataVariant>;
  group: boolean;
};
