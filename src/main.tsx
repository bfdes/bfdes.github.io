import fs from "fs";
import path from "path";
import { About, NoMatch, Post, PostList, Page } from "./components";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Repo from "./repo";
import { execSync } from "child_process";
import parse from "./md";
import Feed from "./feed";

function page(component: JSX.Element): string {
  return `<!DOCTYPE html><html lang="en">${renderToStaticMarkup(
    <Page>{component}</Page>
  )}</html>`;
}

let repo: Repo;

try {
  const posts = fs
    .readdirSync("posts")
    .filter((fileName) => path.parse(fileName).ext == ".md")
    .map((fileName) => {
      const absPath = path.join("posts", fileName);
      return {
        ...parse(fs.readFileSync(absPath)),
        slug: path.parse(fileName).name,
      };
    });
  repo = new Repo(posts);
} catch (_) {
  console.error("Could not parse markup");
  process.exit(1);
}

// site/
fs.rmSync("site", { recursive: true, force: true });
fs.mkdirSync("site");

// feed.rss feed.xml rss.xml
const feed = new Feed(repo.posts);

fs.writeFileSync("site/feed.rss", feed.toString());
fs.writeFileSync("site/feed.xml", feed.toString());
fs.writeFileSync("site/rss.xml", feed.toString());

// about.html
fs.writeFileSync("site/about.html", page(<About />));

// 404.html
fs.writeFileSync("site/404.html", page(<NoMatch />));

// index.html
fs.writeFileSync("site/index.html", page(<PostList posts={repo.posts} />));

// posts/index.html
fs.mkdirSync("site/posts");
fs.writeFileSync(
  "site/posts/index.html",
  page(<PostList posts={repo.posts} />)
);

// posts/<slug>.html
repo.posts
  .map((post) => repo.get(post.slug))
  .forEach((post) =>
    fs.writeFileSync(
      `site/posts/${post.slug}.html`,
      page(<Post value={post} />)
    )
  );

// tags/<tag>.html
fs.mkdirSync("site/tags");
repo.tags.forEach((tag) =>
  fs.writeFileSync(
    `site/tags/${tag.toLowerCase()}.html`,
    page(<PostList posts={repo.filter(tag)} />)
  )
);

function copy(source: string, target: string): void {
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
