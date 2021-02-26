import * as React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import { Post, PaginationLink } from "src/components";

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
});

describe("<Post />", () => {
  const post = {
    title: "My first post",
    summary: "Lorem ipsum delorum sit amet",
    body: "Lorem ipsum delorum sit amet",
    slug: "my-first-post",
    created: new Date("2018-07-22"),
    tags: ["Algorithms", "Java"],
    wordCount: 1,
  };

  it("renders metadata", () => {
    act(() => {
      render(<Post value={post} />, container);
    });
    expect(container.querySelectorAll(".meta")).toHaveLength(1);
  });

  it("renders body", () => {
    act(() => {
      render(<Post value={post} />, container);
    });
    expect(container.querySelectorAll(".body")).toHaveLength(1);
  });

  it("renders pagination bar", () => {
    act(() => {
      render(<Post value={post} />, container);
    });
    expect(container.querySelectorAll(".pagination")).toHaveLength(1);
    expect(container.querySelectorAll(".pagination-item")).toHaveLength(2);
  });
});

describe("<PaginationLink />", () => {
  const msg = "Next post";

  it("renders link", () => {
    act(() => {
      render(
        <PaginationLink next="my-second-post">{msg}</PaginationLink>,
        container
      );
    });
    const link = container.querySelector("a").href;
    expect(link).toMatch(/\/posts\/my-second-post.html$/);
  });

  it("renders message", () => {
    act(() => {
      render(<PaginationLink>{msg}</PaginationLink>, container);
    });
    expect(container.querySelector("span").textContent).toBe(msg);
  });
});
