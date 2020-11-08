import * as React from "react";
import { Route, Switch } from "react-router-dom";
import { About, NoMatch, Sidebar } from "../components";
import * as Components from "../components";
import { withSlug, withTag } from "../hocs";

const App: React.FC = () => {
  const PostOr404 = withSlug(Components.PostOr404);
  const Posts = withTag(Components.Posts);
  return (
    <>
      <Route path="/">
        <Sidebar />
      </Route>
      <div id="content">
        <Switch>
          <Route path="/about">
            <About />
          </Route>
          <Route path="/posts/:slug">
            <PostOr404 />
          </Route>
          <Route exact path={["/", "/posts"]}>
            <Posts />
          </Route>
          <Route>
            <NoMatch />
          </Route>
        </Switch>
      </div>
    </>
  );
};

export default App;
