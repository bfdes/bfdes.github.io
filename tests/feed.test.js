import Feed from "src/feed";

const posts = [
  {
    title: "My second post",
    summary: "Lorem ipsum delorum sit amet",
    body: "Lorem ipsum delorum sit amet",
    slug: "my-second-post",
    created: new Date("2018-10-15"),
    tags: ["Java"],
    wordCount: 2,
  },
  {
    title: "My first post",
    summary: "Lorem ipsum delorum sit amet",
    body: "Lorem ipsum delorum sit amet",
    slug: "my-first-post",
    created: new Date("2018-07-22"),
    tags: ["Algorithms", "Java"],
    wordCount: 1,
  },
];

const serializedFeed = `
    <?xml version="1.0" encoding="utf-8"?>
    <rss version="1.0">
      <channel>
      <title>bfdes.in</title>
      <link>https://www.bfdes.in</link>
      <description>Programming and Technology blog</description>
      <item>
        <title>My second post</title>
        <author>Bruno Fernandes</author>
        <description>Lorem ipsum delorum sit amet</description>
        <link>https://www.bfdes.in/posts/my-second-post.html</link>
        <guid>https://www.bfdes.in/posts/my-second-post.html</guid>
        <pubDate>Mon, 15 Oct 2018 00:00:00 GMT</pubDate>
      </item>
      <item>
        <title>My first post</title>
        <author>Bruno Fernandes</author>
        <description>Lorem ipsum delorum sit amet</description>
        <link>https://www.bfdes.in/posts/my-first-post.html</link>
        <guid>https://www.bfdes.in/posts/my-first-post.html</guid>
        <pubDate>Sun, 22 Jul 2018 00:00:00 GMT</pubDate>
      </item>
      </channel>
    </rss>
  `.replace(/ {2}|[\t\n\r]/gm, ""); // removes newlines and tabs, including those indented with spaces

const feed = new Feed(posts);

describe("Feed.toString", () => {
  it("serializes RSS feed", () => {
    expect(feed.toString()).toBe(serializedFeed);
  });
});
