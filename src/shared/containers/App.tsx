import * as React from "react";
import { Route, Routes } from "react-router-dom";
import { About, NoMatch, Sidebar, Posts, PostOr404 } from "../components";

const App: React.FC = () => {
  return (
    <>
      <Route element={<Sidebar />} />
      <div id="content">
        <Routes>
          <Route element={<Posts />} />
          <Route path="about" element={<About />} />
          <Route path="posts">
            <Route element={<Posts />} />
            <Route path=":slug" element={<PostOr404 />} />
          </Route>
          <Route path="tags">
            <Route path=":tag" element={<Posts />} />
          </Route>
          <Route path="*" element={<NoMatch />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
