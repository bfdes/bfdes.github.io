import Repo from "src/repo";
import isSorted from "./isSorted";

expect.extend({
  toBeSorted(received, cmp) {
    const pass = isSorted(received, cmp);
    if (pass) {
      return {
        message: () => `expected [${received}] not to be sorted`,
        pass,
      };
    } else {
      return {
        message: () => `expected [${received}] to be sorted`,
        pass,
      };
    }
  },
});

const posts = [
  {
    title: "My first post",
    summary: "Lorem ipsum delorum sit amet",
    body: "Lorem ipsum delorum sit amet",
    slug: "my-first-post",
    created: new Date("2018-07-22"),
    tags: ["Algorithms", "Java"],
    wordCount: 1,
  },
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
    title: "My third post",
    summary: "Lorem ipsum delorum sit amet",
    body: "Lorem ipsum delorum sit amet",
    slug: "my-third-post",
    created: new Date("2019-06-15"),
    tags: ["Python"],
    wordCount: 3,
  },
];

const repo = new Repo(posts);

describe("Repo.posts", () => {
  it("returns all posts", () =>
    expect(repo.posts.length).toEqual(posts.length));

  it("returns posts in reverse chronological order", () => {
    const cmp = (p, q) => q.created - p.created;
    expect(repo.posts).toBeSorted(cmp);
  });

  it("returns paged posts", () => {
    const [first, second, third] = posts;
    expect(repo.posts[0]).toEqual({
      ...first,
      previous: second.slug,
    });
    expect(repo.posts[1]).toEqual({
      ...second,
      previous: third.slug,
      next: first.slug,
    });
    expect(repo.posts[2]).toEqual({
      ...third,
      next: second.slug,
    });
  });
});

describe("Repo.tags", () => {
  it("returns all tags", () => {
    const actualtags = new Set(repo.tags);
    const expectedTags = new Set(posts.flatMap((p) => p.tags));
    expect(actualtags).toEqual(expectedTags);
  });
});