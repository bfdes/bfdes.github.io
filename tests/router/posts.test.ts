import app from "server/app";
import * as request from "supertest";

const summary = "Lorem ipsum";
const body = "Lorem ipsum delorum sit amet";
const wordCount = 5;

const posts = [
  {
    title: "My first post",
    slug: "my-first-post",
    summary,
    body,
    created: 1523401300000,
    tags: ["Algorithms", "Java"],
    wordCount,
  },
  {
    title: "My second post",
    slug: "my-second-post",
    summary,
    body,
    created: 1523487600000,
    tags: ["Java"],
    wordCount,
  },
];

const server = app(posts, "test");

describe("GET /posts", () => {
  it("returns all posts", () => request(server).get("/posts").expect(200));

  it("serves same content as root request", () =>
    request(server)
      .get("/")
      .then((res) =>
        request(server)
          .get("/posts")
          .then((res2) => expect(res.text).toEqual(res2.text))
      ));

  it("filters posts by tag", () => {
    const tag = "Algorithms";
    const taggedPosts = posts.filter((p) => p.tags.includes(tag));
    return request(server)
      .get(`/tags/${tag}`)
      .expect(200)
      .then((res) => {
        const elem = /<li class="post">/g;
        const actualCount = (res.text.match(elem) || []).length;
        const expectedCount = taggedPosts.length;
        return expect(actualCount).toBe(expectedCount);
      });
  });
});

describe("GET /feed.rss", () => {
  const markup = `
    <?xml version="1.0" encoding="utf-8"?>
    <rss version="1.0">
      <channel>
        <title>bfdes.in</title>
        <link>https://www.bfdes.in</link>
        <description>Programming and Technology blog</description>
        ${posts
          .map(({ created, slug, title, summary }) => {
            const date = new Date(created);
            const url = `https://www.bfdes.in/posts/${slug}`;
            return `
              <item>
                <title>${title}</title>
                <author>Bruno Fernandes</author>
                <description>${summary}</description>
                <link>${url}</link>
                <guid>${url}</guid>
                <pubDate>${date.toUTCString()}</pubDate>
              </item> 
            `;
          })
          .join("")}
      </channel>
    </rss>
  `
    .trim()
    .replace(/>\s+</g, "><"); // Get rid of whitespace

  test("posts returned in feed", () =>
    request(server)
      .get("/feed.rss")
      .expect(200)
      .then((res) => expect(res.text).toEqual(markup)));
});
