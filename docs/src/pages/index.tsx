import { Redirect } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';


export default function Home(): JSX.Element {
  const url = useBaseUrl("/docs/overview");
  return <Redirect to={url} />;
}
