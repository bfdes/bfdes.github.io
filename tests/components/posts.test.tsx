import * as React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import { PostList } from "src/components";

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
});

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

describe("<PostList />", () => {
  it("renders all posts", () => {
    act(() => {
      render(<PostList posts={posts} />, container);
    });
    expect(container.querySelectorAll(".posts")).toHaveLength(1);
    expect(container.querySelectorAll(".post")).toHaveLength(posts.length);
  });
});
