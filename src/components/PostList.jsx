import Template from "../template";
import TagList from "./TagList";
import Date from "./Date";
import WordCount from "./WordCount";
import Page from "./Page";

const Post = ({ value }) => {
  const { title, slug, wordCount, created, tags } = value;
  return (
    <li className="post">
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
  );
};

const PostList = ({ posts }) => (
  <Page>
    <div className="posts">
      <h1>Blog</h1>
      <ul id="posts">
        {posts.map((post) => (
          <Post key={post.slug} value={post} />
        ))}
      </ul>
    </div>
  </Page>
);

export default PostList;
