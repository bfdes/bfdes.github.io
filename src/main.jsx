import Template from "./template";
import Feed from "./feed";
import Repo from "./repo";
import { About, NoMatch, Post, PostList, Dir, File } from "./components";
import slugify from "./slugify";

const repo = Repo.fromDir("posts");

const posts = repo.posts.map(({ slug }) => repo.get(slug));
const tags = Array.from(repo.tags);
const feed = new Feed(posts);

const router = (
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
          <PostList posts={repo.filter(tag)} />
        </File>
      ))}
    </Dir>
    <File name="feed.rss">{feed.toString()}</File>
    <File name="feed.xml">{feed.toString()}</File>
    <File name="rss.xml">{feed.toString()}</File>
  </Dir>
);

router.write(".");

function copy(source, target) {
  try {
    execSync(`cp -R ${source} ${target}`, { stdio: "ignore" });
  } catch (_) {
    console.error(`Could not move ${source} to ${target}`);
    process.exit(1);
  }
}

// styles/*.{css}
copy("styles", "site/styles");

// images/*.{jpg, png}
copy("images", "site/images");
