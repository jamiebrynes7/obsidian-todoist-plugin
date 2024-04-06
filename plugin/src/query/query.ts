export enum SortingVariant {
  Priority = 0,
  PriorityAscending = 1,
  Date = 2,
  DateDescending = 3,
  Order = 4,
  DateAdded = 5,
  DateAddedDescending = 6,
}

export enum ShowMetadataVariant {
  Due = 0,
  Project = 1,
  Labels = 2,
  Description = 3,
}

export enum GroupVariant {
  None = 0,
  Project = 1,
  Section = 2,
  Priority = 3,
  Date = 4,
  Label = 5,
}

export type Query = {
  name: string;
  filter: string;
  autorefresh: number;
  sorting: SortingVariant[];
  show: Set<ShowMetadataVariant>;
  groupBy: GroupVariant;
};
