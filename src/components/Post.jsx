import PropTypes from "prop-types";
import Template from "../template";
import Date from "./Date";
import Page from "./Page";
import PaginationLink from "./PaginationLink";
import TagList from "./TagList";
import WordCount from "./WordCount";

const Post = ({ title, body, created, tags, wordCount, previous, next }) => (
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

Post.propTypes = {
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  created: PropTypes.instanceOf(global.Date).isRequired,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  wordCount: PropTypes.number.isRequired,
  previous: PropTypes.string,
  next: PropTypes.string,
};

export default Post;
