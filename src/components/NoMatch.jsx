import Page from "./Page";
import Template from "../template";

const NoMatch = () => (
  <Page>
    <div className="fourOhFour">
      <h1>404: Not Found</h1>
      <p>Hmm it looks like you{"'"}re in the wrong place.</p>
    </div>
  </Page>
);

export default NoMatch;
