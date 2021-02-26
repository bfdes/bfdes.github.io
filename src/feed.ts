import { node, Attributes, Branch } from "xml";

type Meta = {
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  created: Date;
};

export default class Feed extends Branch {
  constructor(metaData: Meta[]) {
    const title = node("title", "bfdes.in");
    const link = node("link", "https://www.bfdes.in");
    const description = node("description", "Programming and Technology blog");
    const items = metaData.map(({ created, slug, title, summary }) => {
      const url = `https://www.bfdes.in/posts/${slug}.html`;
      return node("item", [
        node("title", title),
        node("author", "Bruno Fernandes"),
        node("description", summary),
        node("link", url),
        node("guid", url),
        node("pubDate", created.toUTCString()),
      ]);
    });
    const channel = node("channel", [title, link, description, ...items]);
    super("rss", [channel], new Attributes([["version", "1.0"]]));
  }

  public toString(): string {
    const prolog = `<?xml version="1.0" encoding="utf-8"?>`;
    return `${prolog}${super.toString()}`;
  }
}
