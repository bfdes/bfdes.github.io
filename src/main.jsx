import Template from "./template";
import Feed from "./feed";
import { About, NoMatch, Post, PostList, Dir, File } from "./components";
import slugify from "./slugify";
import { RepoReader } from "./fileReaders";
import { FileWriter } from "./fileWriters";
import { Avatar } from "./images";
import css from "./main.css";
import fs from "fs";
import path from "path";

const repoReader = new RepoReader(fs);
const repo = repoReader.read(path.join(__dirname, "posts"));

const posts = repo.posts;
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

const fileWriter = new FileWriter(fs);

fileWriter.write(".", router);
