import React from "react";
import TagList from "./TagList";
import Date from "./Date";
import WordCount from "./WordCount";

type Post = {
  title: string;
  slug: string;
  wordCount: number;
  tags: string[];
  created: Date;
};

type PostProps = {
  value: Post;
};

const Post: React.FC<PostProps> = ({ value }: PostProps) => {
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

type PostListProps = {
  posts: Post[];
};

const PostList: React.FC<PostListProps> = ({ posts }: PostListProps) => (
  <div className="posts">
    <h1>Blog</h1>
    <ul id="posts">
      {posts.map((post) => (
        <Post key={post.slug} value={post} />
      ))}
    </ul>
  </div>
);

export default PostList;
