import * as React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import { PostOr404 } from "shared/components";
import { Context } from "shared/containers";

let container: HTMLDivElement = null;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

describe("<Post />", () => {
  const post = {
    title: "My second post",
    slug: "my-second-post",
    summary: "Lorem ipsum",
    body: "Lorem ipsum delorum sit amet",
    wordCount: 5,
    tags: ["Algorithms", "Java"],
    created: 1523401200000,
    previous: "my-first-post",
    next: "my-third-post",
  };

  it("renders post", () => {
    act(() => {
      render(
        <MemoryRouter>
          <Context.Post.Provider value={post}>
            <PostOr404 />
          </Context.Post.Provider>
        </MemoryRouter>,
        container
      );
    });
    expect(container.querySelectorAll(".post")).toHaveLength(1);
  });
});
