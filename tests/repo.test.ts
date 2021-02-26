import Repo from "src/repo";

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
  it("returns all posts", () => {
    const actualPosts = new Set(repo.posts);
    const expectedPosts = new Set(posts);
    expect(actualPosts).toEqual(expectedPosts);
  });
  it("returns posts in reverse chronological order", () => {
    const orderedPosts = posts.sort(
      (p, q) => p.created.getTime() - q.created.getTime()
    );
    expect(repo.posts).toEqual(orderedPosts);
  });
});

describe("Repo.tags", () => {
  it("returns all tags", () => {
    const actualtags = new Set(repo.tags);
    const expectedTags = new Set(posts.flatMap((p) => p.tags));
    expect(actualtags).toEqual(expectedTags);
  });
});

describe("Repo.filter", () => {
  it("filters posts by tag", () => {
    const tag = "Algorithms";
    const taggedPosts = posts.filter((p) => p.tags.includes(tag));
    const actualPosts = new Set(repo.filter(tag));
    const expectedPosts = new Set(taggedPosts);
    expect(actualPosts).toEqual(expectedPosts);
  });
});

describe("Repo.get", () => {
  it("fetches posts by slug", () => {
    const slug = posts[0].slug;
    expect(repo.get(slug)).not.toBeNull();
  });
  it("returns paged posts", () => {
    const [first, second, third] = posts;
    expect(repo.get(first.slug)).toEqual({
      ...first,
      previous: second.slug,
    });
    expect(repo.get(second.slug)).toEqual({
      ...second,
      previous: third.slug,
      next: first.slug,
    });
    expect(repo.get(third.slug)).toEqual({
      ...third,
      next: second.slug,
    });
  });
  it("returns null for non-existent posts", () =>
    expect(repo.get("my-fourth-post")).toBeNull());
});
