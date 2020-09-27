export default interface IQuery {
  name: string;
  filter: string;
  autorefresh?: number;
  sorting?: string[];
  group: boolean;
}
