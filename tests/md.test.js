import { MetadataParseError, MissingMetadataError, parse } from "src/md";

describe("md.parse", () => {
  it("extracts frontmatter", () => {
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
    ].join("\n");

    const post = parse(Buffer.from(markup));

    expect(post.title).toBe(meta.title);
    expect(post.tags).toEqual(meta.tags);
    expect(post.created).toEqual(new Date(meta.created));
    expect(post.summary).toBe(meta.summary);
  });

  it("extracts article", () => {
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
      "# Complex numbers",
      "Python supports complex numbers natively. For example, $1 + 2*j$ is written as",
      "```python",
      "1 + 2j",
      "```",
    ].join("\n");

    const post = parse(Buffer.from(markup));

    expect(post.body).toBeDefined();
  });

  it("computes article word count", () => {
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
      "# Complex numbers",
      "Python supports complex numbers natively. For example, $1 + 2*j$ is written as",
      "```python",
      "1 + 2j",
      "```",
    ].join("\n");

    const post = parse(Buffer.from(markup));

    expect(post.wordCount).toBe(12);
  });

  it("handles missing frontmatter", () => {
    const markup = ["---", "---"].join("\n");

    const contents = Buffer.from(markup);

    expect(() => parse(contents)).toThrow(MissingMetadataError);
  });

  it("handles malformed frontmatter", () => {
    const meta = {
      title: "Complex numbers",
      tags: [1, 2],
      created: "",
    };

    const markup = [
      "---",
      `title: ${meta.title}`,
      `tags: [${meta.tags.join(", ")}]`,
      `created: ${meta.created}`,
      "---",
    ].join("\n");

    const contents = Buffer.from(markup);

    expect(() => parse(contents)).toThrow(MetadataParseError);
  });
});
