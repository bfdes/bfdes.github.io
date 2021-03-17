import Template from "../template"
import Date from "./Date";
import PaginationLink from "./PaginationLink";
import TagList from "./TagList";
import WordCount from "./WordCount";
import Page from "./Page";

const Post = ({ value }) => {
  const { title, body, created, tags, wordCount, previous, next } = value;
  return (
    <Page>
      <div className="post">
        <h1>{title}</h1>
        <p className="meta">
          <Date value={created} />
          {" · "}
          <TagList tags={tags} />
          {" · "}
          <WordCount value={wordCount} />
        </p>
        <div className="body" dangerouslySetInnerHTML={{ __html: body }} />
      </div>
      <div className="pagination">
        <PaginationLink next={previous}>Previous</PaginationLink>
        <PaginationLink next={next}>Next</PaginationLink>
      </div>
    </Page>
  );
};

export default Post;
