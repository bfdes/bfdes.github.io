import Template from "./template";
import fs from "fs";
import path from "path";
import { About, NoMatch, Post, PostList, Page, Dir, File } from "./components";
import Repo from "./repo";
import parse from "./md";
import Feed from "./feed";
import slugify from "./slugify";

let repo;

try {
  const posts = fs
    .readdirSync("posts")
    .map((fileName) => path.join("posts", fileName))
    .filter((absPath) => path.parse(absPath).ext == ".md")
    .map((absPath) => parse(fs.readFileSync(absPath)));
  repo = new Repo(posts);
} catch (_) {
  console.error("Could not parse markup");
  process.exit(1);
}

const posts = repo.posts.map(({ slug }) => repo.get(slug));
const tags = Array.from(repo.tags);

const router = (
  <Dir name="site">
    <File name="about.html">
      <About />
    </File>
    <File name="404.html">
      <NoMatch />
    </File>
    <File name="index.html">
      <PostList posts={repo.posts} />
    </File>
    <Dir name="posts">
      <File name="index.html">
        <PostList posts={repo.posts} />
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
  </Dir>
);

router.write(".");

// feed.rss feed.xml rss.xml
// const feed = new Feed(repo.posts);

// fs.writeFileSync("site/feed.rss", feed.toString());
// fs.writeFileSync("site/feed.xml", feed.toString());
// fs.writeFileSync("site/rss.xml", feed.toString());

// function copy(source, target) {
//   try {
//     execSync(`cp -R ${source} ${target}`, { stdio: "ignore" });
//   } catch (_) {
//     console.error(`Could not move ${source} to ${target}`);
//     process.exit(1);
//   }
// }

// styles/*.{css}
// copy("styles", "site/styles");

// images/*.{jpg, png}
// copy("images", "site/images");
