import { Router } from "express";
import * as React from "react";
import { renderToStaticNodeStream } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";

import { App } from "shared/containers";
import { Context } from "shared/containers";
import DB from "shared/db";
import { Favicon } from "shared/images";
import { node, Attributes } from "./xml";

const header = `
    <!DOCTYPE html><html lang="en">
      <head>
        <meta charset="utf8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="theme-color" content="#202020">
        <meta name="description" content="Personal blog">
        <meta name="author" content="Bruno Fernandes">
        <title>bfdes.in</title>
        <link href=${Favicon} rel="icon">
        <link href="https://fonts.googleapis.com/css?family=Roboto|Roboto+Mono&display=swap" rel="stylesheet">
        <link href="https://unpkg.com/highlight.js@10.3.1/styles/github.css" rel="stylesheet">
        <link href="https://unpkg.com/katex@0.12.0/dist/katex.min.css" rel="stylesheet">
        <link href="/static/styles/main.css" rel="stylesheet">
      </head>
      <body>
        <div id="root">
  `;

export default function (db: DB): Router {
  const router = Router();

  // GET /about
  router.get("/about", (req, res) => {
    const stream = renderToStaticNodeStream(
      <StaticRouter location={req.url}>
        <App />
      </StaticRouter>
    );

    res.write(header);
    stream.pipe(res, { end: false });
    stream.on("end", () => res.end("</div></body></html>"));
  });

  // GET / is an alias for GET /posts
  router.get("/", (req, res) => {
    const posts = db.list();

    const stream = renderToStaticNodeStream(
      <StaticRouter location={req.url}>
        <Context.Posts.Provider value={posts}>
          <App />
        </Context.Posts.Provider>
      </StaticRouter>
    );

    res.write(header);
    stream.pipe(res, { end: false });
    stream.on("end", () => res.end("</div></body></html>"));
  });

  // GET /posts
  router.get("/posts", (req, res) => {
    const posts = db.list();

    const stream = renderToStaticNodeStream(
      <StaticRouter location={req.url}>
        <Context.Posts.Provider value={posts}>
          <App />
        </Context.Posts.Provider>
      </StaticRouter>
    );

    res.write(header);
    stream.pipe(res, { end: false });
    stream.on("end", () => res.end("</div></body></html>"));
  });

  // GET /tags/<tag>
  router.get("/tags/:tag", (req, res) => {
    const { tag } = req.params;
    const posts = db.list(tag);

    const stream = renderToStaticNodeStream(
      <StaticRouter location={req.url}>
        <Context.Posts.Provider value={posts}>
          <App />
        </Context.Posts.Provider>
      </StaticRouter>
    );

    res.write(header);
    stream.pipe(res, { end: false });
    stream.on("end", () => res.end("</div></body></html>"));
  });

  // GET /posts/<slug>
  router.get("/posts/:slug", (req, res) => {
    const { slug } = req.params;
    const postOrNone = db.get(slug);

    const stream = renderToStaticNodeStream(
      <StaticRouter location={req.url}>
        <Context.Post.Provider value={postOrNone}>
          <App />
        </Context.Post.Provider>
      </StaticRouter>
    );
    res.status(postOrNone ? 200 : 404);
    res.write(header);
    stream.pipe(res, { end: false });
    stream.on("end", () => res.end("</div></body></html>"));
  });

  // GET /feed.rss
  router.get("/feed.rss|/feed.xml|/rss.xml", (_, res) => {
    const recentPosts = db.list().slice(0, 10);
    const title = node("title", "bfdes.in");
    const link = node("link", "https://www.bfdes.in");
    const description = node("description", "Programming and Technology blog");
    const items = recentPosts.map(({ created, slug, title, summary }) => {
      const date = new Date(created);
      const url = `https://www.bfdes.in/posts/${slug}`;
      return node("item", [
        node("title", title),
        node("author", "Bruno Fernandes"),
        node("description", summary),
        node("link", url),
        node("guid", url),
        node("pubDate", date.toUTCString()),
      ]);
    });
    const channel = node("channel", [title, link, description, ...items]);
    const rss = node("rss", [channel], new Attributes([["version", "1.0"]]));
    const prolog = `<?xml version="1.0" encoding="utf-8"?>`;
    res.type("application/xml");
    res.send(`${prolog}${rss.render()}`);
  });

  // 404 handler
  router.get("*", (req, res) => {
    const stream = renderToStaticNodeStream(
      <StaticRouter location={req.url}>
        <App />
      </StaticRouter>
    );
    res.status(404);
    res.write(header);
    stream.pipe(res, { end: false });
    stream.on("end", () => res.end("</div></body></html>"));
  });
  return router;
}
