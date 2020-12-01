import * as React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";

import { Posts } from "shared/components";
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

describe("<Posts />", () => {
  const summary = "Lorem ipsum";
  const wordCount = 5;

  const posts = [
    {
      title: "My first post",
      slug: "my-first-post",
      summary,
      created: 1523401200000,
      tags: ["Algorithms", "Java"],
      wordCount,
    },
    {
      title: "My second post",
      slug: "my-second-post",
      summary,
      created: 1523487600000,
      tags: ["Java"],
      wordCount,
    },
  ];

  it("renders posts", () => {
    act(() => {
      render(
        <MemoryRouter>
          <Context.Posts.Provider value={posts}>
            <Posts />
          </Context.Posts.Provider>
        </MemoryRouter>,
        container
      );
    });
    expect(container.querySelectorAll(".post")).toHaveLength(posts.length);
  });
});
