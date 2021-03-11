import parse from "src/md";

const meta = {
  title: "Complex numbers",
  tags: ["Python", "Maths"],
  created: "2018-07-22",
  summary: "Representing complex numbers in Python",
};

const markup = [
  "---",
  `title: ${meta.title}`,
  `tags: [${meta.tags.join(", ")}]`,
  `created: ${meta.created}`,
  `summary: ${meta.summary}`,
  "---",
  `
  # Complex numbers
    
  Python supports complex numbers natively. For example, $1 + 2*j$ is written as

  \`\`\`python
  1 + 2j
  \`\`\`
  `,
].join("\n");

const post = parse(Buffer.from(markup));

describe("md.parse", () => {
  it("extracts frontmatter", () => {
    expect(post.title).toBe(meta.title);
    expect(post.tags).toEqual(meta.tags);
    expect(post.created).toEqual(new Date(meta.created));
    expect(post.summary).toBe(meta.summary);
  });

  it("extracts an article body", () => expect(post.body).toBeDefined());

  it("computes an article word count", () => expect(post.wordCount).toBe(12));
});
