import * as React from "react";
import { Context } from "shared/containers";
import Date from "./Date";
import NoMatch from "./NoMatch";
import PaginationLink from "./PaginationLink";
import Tags from "./Tags";

const PostOr404: React.FC = () => {
  const postOrNone = React.useContext(Context.Post);
  if (!postOrNone) {
    return <NoMatch />;
  }
  const { title, body, created, tags, wordCount, previous, next } = postOrNone;
  return (
    <>
      <div className="post">
        <h1>{title}</h1>
        <p className="meta">
          <Date timestamp={created} />
          {" · "}
          <Tags tags={tags} />
          {" · "}
          {wordCount} {wordCount !== 1 ? " words" : " word"}
        </p>
        <div dangerouslySetInnerHTML={{ __html: body }} />
      </div>
      <div className="pagination">
        <PaginationLink next={previous}>Previous</PaginationLink>
        <PaginationLink next={next}>Next</PaginationLink>
      </div>
    </>
  );
};

export default PostOr404;
