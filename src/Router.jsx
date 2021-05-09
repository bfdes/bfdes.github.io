import { About, Dir, File, NoMatch, Post, PostList } from "./components";
import Feed from "./feed";
import { Avatar } from "./images";
import css from "./main.css";
import slugify from "./slugify";
import Template from "./template";

export default function Router(repo) {
  const posts = repo.posts;
  const tags = Array.from(repo.tags);
  const feed = new Feed(posts);

  return (
    <Dir name="site">
      <File name="about.html">
        <About />
      </File>
      <File name="404.html">
        <NoMatch />
      </File>
      <File name="index.html">
        <PostList posts={posts} />
      </File>
      <Dir name="posts">
        <File name="index.html">
          <PostList posts={posts} />
        </File>
        {posts.map((post) => (
          <File name={`${post.slug}.html`} key={post.slug}>
            <Post value={post} />
          </File>
        ))}
      </Dir>
      <Dir name="tags">
        {tags.map((tag) => (
          <File name={`${slugify(tag)}.html`} key={tag}>
            <PostList posts={posts.filter(({ tags }) => tags.includes(tag))} />
          </File>
        ))}
      </Dir>
      <Dir name="images">
        <File name="avatar.jpg">{Avatar}</File>
      </Dir>
      <Dir name="styles">
        <File name="main.css">{css}</File>
      </Dir>
      <File name="feed.rss">{feed.toString()}</File>
      <File name="feed.xml">{feed.toString()}</File>
      <File name="rss.xml">{feed.toString()}</File>
    </Dir>
  );
}
