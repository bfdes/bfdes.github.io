import * as React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";

import { App, Context } from "shared/containers";

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

const summary = "Lorem ipsum";
const body = "Lorem ipsum delorum sit amet";
const wordCount = 5;

const posts = [
  {
    title: "My first post",
    slug: "my-first-post",
    summary,
    body,
    created: 1523401300000,
    tags: ["Algorithms", "Java"],
    wordCount,
  },
  {
    title: "My second post",
    slug: "my-second-post",
    summary,
    body,
    created: 1523487600000,
    tags: ["Java"],
    wordCount,
  },
];

describe("<App />", () => {
  it("renders <About /> for /about", () => {
    act(() => {
      render(
        <MemoryRouter initialEntries={["/about"]}>
          <App />
        </MemoryRouter>,
        container
      );
    });
    expect(container.querySelectorAll("#sidebar")).toHaveLength(1);
    expect(container.querySelectorAll(".about")).toHaveLength(1);
  });

  it("renders <NoMatch /> for non-existent route", () => {
    act(() => {
      render(
        <MemoryRouter initialEntries={["/random"]}>
          <App />
        </MemoryRouter>,
        container
      );
    });
    expect(container.querySelectorAll("#sidebar")).toHaveLength(1);
    expect(container.querySelectorAll(".fourOhFour")).toHaveLength(1);
  });

  it("renders <Posts /> for root page", () => {
    global.__isBrowser__ = false;

    act(() => {
      render(
        <MemoryRouter initialEntries={["/"]}>
          <Context.Posts.Provider value={posts}>
            <App />
          </Context.Posts.Provider>
        </MemoryRouter>,
        container
      );
    });
    expect(container.querySelectorAll("#sidebar")).toHaveLength(1);
    expect(container.querySelectorAll(".posts")).toHaveLength(1);
  });

  it("renders <Posts /> for /posts", () => {
    global.__isBrowser__ = false;

    act(() => {
      render(
        <MemoryRouter initialEntries={["/posts"]}>
          <Context.Posts.Provider value={posts}>
            <App />
          </Context.Posts.Provider>
        </MemoryRouter>,
        container
      );
    });
    expect(container.querySelectorAll("#sidebar")).toHaveLength(1);
    expect(container.querySelectorAll(".posts")).toHaveLength(1);
  });

  it("renders a <Post /> for /posts/:slug", () => {
    global.__isBrowser__ = false;
    const post = posts[0];

    act(() => {
      render(
        <MemoryRouter initialEntries={[`/posts/${post.slug}`]}>
          <Context.Post.Provider value={post}>
            <App />
          </Context.Post.Provider>
        </MemoryRouter>,
        container
      );
    });
    expect(container.querySelectorAll("#sidebar")).toHaveLength(1);
    expect(container.querySelectorAll(".post")).toHaveLength(1);
  });
});
