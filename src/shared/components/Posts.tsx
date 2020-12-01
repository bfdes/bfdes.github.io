import * as React from "react";
import { Link } from "react-router-dom";
import { Context } from "shared/containers";
import Date from "./Date";
import Tags from "./Tags";

const PostStub: React.FC<PostStub> = (props: PostStub) => {
  const { title, slug, wordCount, created, tags } = props;
  return (
    <li className="post">
      <Link to={`/posts/${slug}`} className="nav-item">
        <h3>{title}</h3>
      </Link>
      <p className="meta">
        <Date timestamp={created} />
        {" · "}
        <Tags tags={tags} />
        {" · "}
        {wordCount} {wordCount !== 1 ? "words" : "word"}
      </p>
    </li>
  );
};

const Posts: React.FC = () => {
  const posts = React.useContext(Context.Posts);
  return (
    <div className="posts">
      <h1>Blog</h1>
      <ul id="posts">
        {posts.map((post) => (
          <PostStub key={post.slug} {...post} />
        ))}
      </ul>
    </div>
  );
};

export default Posts;
