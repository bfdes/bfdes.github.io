import { Attributes, node } from "server/xml";

const attributes = new Attributes([
  ["key1", "value1"],
  ["key2", "value2"]
]);

describe("Leaf.render", () => {
  it("serializes attributes", () => {
    const leaf = node("leaf", "content", attributes);
    expect(leaf.render()).toMatch(/^<leaf key1="value1" key2="value2">/);
  });

  it("serializes content", () => {
    const leaf = node("leaf", "content");
    expect(leaf.render()).toEqual("<leaf>content</leaf>");
  });

  it.skip("serializes self-closing tags", () => {
    const leaf = node("leaf", "");
    expect(leaf.render()).toEqual("<leaf />");
  });
});

describe("Branch.render", () => {
  it("serializes attributes", () => {
    const leaf = node("leaf", "content");
    const root = node("root", [leaf], attributes);
    expect(root.render()).toMatch(/^<root key1="value1" key2="value2">/);
  });

  it("serializes nested elements", () => {
    const leaf = node("leaf", "content");
    const root = node("root", [leaf]);
    expect(root.render()).toEqual("<root><leaf>content</leaf></root>");
  });

  it("serializes siblings", () => {
    const author = node("author", "John Doe");
    const item1 = node("item", "Hello");
    const item2 = node("item", "World");
    const root = node("root", [author, item1, item2]);
    expect(root.render()).toEqual(
      "<root><author>John Doe</author><item>Hello</item><item>World</item></root>"
    );
  });
});