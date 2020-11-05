import * as React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { MemoryRouter, Route } from "react-router-dom";

import { PostOr404 } from "shared/components";
import { Context } from "shared/containers";
import { withSlug } from "shared/hocs";
import { RequestError } from "shared/http";

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

test("withSlug", () => {
  const slug = "my-first-post";
  const WithSlug = withSlug(({ slug }) => <>{slug}</>);
  render(
    <MemoryRouter initialEntries={[`/posts/${slug}`]}>
      <Route path="/posts/:slug">
        <WithSlug />
      </Route>
    </MemoryRouter>,
    container
  );
  expect(container.textContent).toBe(slug);
});

describe("<PostOr404 />", () => {
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

  describe("on server", () => {
    beforeAll(() => {
      global.__isBrowser__ = false;
    });

    it("displays post", () => {
      act(() => {
        render(
          <MemoryRouter>
            <Context.Post.Provider value={post}>
              <PostOr404 get={jest.fn()} slug="test" />
            </Context.Post.Provider>
          </MemoryRouter>,
          container
        );
      });
      expect(container.querySelectorAll(".post")).toHaveLength(1);
    });
  });

  describe("on client", () => {
    beforeAll(() => {
      global.__isBrowser__ = true;
    });

    it("displays post", async () => {
      const mockPromise = Promise.resolve(post);
      const get = jest.fn(() => mockPromise);

      await act(async () => {
        render(
          <MemoryRouter>
            <PostOr404 get={get} slug="test" />
          </MemoryRouter>,
          container
        );
      });

      expect(container.querySelectorAll(".post")).toHaveLength(1);
    });

    it("displays <NoMatch /> when post does not exist", async () => {
      const err = new RequestError(404, "404: No post with that slug");
      const mockPromise = Promise.reject(err);
      const get = jest.fn(() => mockPromise);

      await act(async () => {
        render(
          <MemoryRouter>
            <PostOr404 get={get} slug="test" />
          </MemoryRouter>,
          container
        );
      });

      expect(container.querySelectorAll(".fourOhFour")).toHaveLength(1);
    });

    it("fetches the correct post", async () => {
      const { slug } = post;
      const mockPromise = Promise.resolve(post);
      const get = jest.fn(() => mockPromise);

      await act(async () => {
        render(
          <MemoryRouter>
            <PostOr404 get={get} slug={slug} />
          </MemoryRouter>,
          container
        );
      });
      expect(get).toHaveBeenCalledWith(`/api/posts/${slug}`, expect.anything());
    });

    it("displays error message for failed request", async () => {
      const mockPromise = Promise.reject(new Error());
      const get = jest.fn(() => mockPromise);

      await act(async () => {
        render(
          <MemoryRouter>
            <PostOr404 get={get} slug="test" />
          </MemoryRouter>,
          container
        );
      });

      expect(container.querySelectorAll(".error")).toHaveLength(1);
    });
  });
});
