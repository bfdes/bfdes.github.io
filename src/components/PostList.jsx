import PropTypes from "prop-types";
import Template from "../template";
import TagList from "./TagList";
import Date from "./Date";
import WordCount from "./WordCount";
import Page from "./Page";

const PostList = ({ posts }) => (
  <Page>
    <div className="posts">
      <h1>Blog</h1>
      <ul id="posts">
        {posts.map(({ title, slug, created, tags, wordCount }) => (
          <li className="post" key={slug}>
            <a href={`/posts/${slug}.html`} className="nav-item">
              <h3>{title}</h3>
            </a>
            <p className="meta">
              <Date value={created} />
              {" · "}
              <TagList tags={tags} />
              {" · "}
              <WordCount value={wordCount} />
            </p>
          </li>
        ))}
      </ul>
    </div>
  </Page>
);

PostList.propTypes = {
  posts: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
      created: PropTypes.instanceOf(global.Date).isRequired,
      tags: PropTypes.arrayOf(PropTypes.string).isRequired,
      wordCount: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default PostList;
