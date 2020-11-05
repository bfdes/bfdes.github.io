import * as React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { MemoryRouter, Route } from "react-router-dom";

import { Posts } from "shared/components";
import { Context } from "shared/containers";
import { withTag } from "shared/hocs";
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

test("withTag", () => {
  const tag = "Python";
  const WithTag = withTag(({ tag }) => <>{tag}</>);
  render(
    <MemoryRouter initialEntries={[`/posts?tag=${tag}`]}>
      <Route path="/posts">
        <WithTag />
      </Route>
    </MemoryRouter>,
    container
  );
  expect(container.textContent).toBe(tag);
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

  describe("on server", () => {
    beforeAll(() => {
      global.__isBrowser__ = false;
    });

    it("displays posts", () => {
      act(() => {
        render(
          <MemoryRouter>
            <Context.Posts.Provider value={posts}>
              <Posts get={jest.fn()} />
            </Context.Posts.Provider>
          </MemoryRouter>,
          container
        );
      });
      expect(container.querySelectorAll(".post")).toHaveLength(posts.length);
    });

    it("asks the reader to return", () => {
      act(() => {
        render(
          <MemoryRouter>
            <Context.Posts.Provider value={[]}>
              <Posts get={jest.fn()} />
            </Context.Posts.Provider>
          </MemoryRouter>,
          container
        );
      });
      expect(container.querySelectorAll(".error")).toHaveLength(1);
    });
  });

  describe("on client", () => {
    beforeAll(() => {
      global.__isBrowser__ = true;
    });

    it("displays posts", async () => {
      const mockPromise = Promise.resolve(posts);
      const get = jest.fn(() => mockPromise);

      await act(async () => {
        render(
          <MemoryRouter>
            <Posts get={get} />
          </MemoryRouter>,
          container
        );
      });

      expect(container.querySelectorAll(".post")).toHaveLength(posts.length);
    });

    it("asks the reader to return", async () => {
      const mockPromise = Promise.resolve([]);
      const get = jest.fn(() => mockPromise);

      await act(async () => {
        render(
          <MemoryRouter>
            <Posts get={get} />
          </MemoryRouter>,
          container
        );
      });
      expect(container.querySelectorAll(".error")).toHaveLength(1);
    });

    it("fetches posts with the correct tag", async () => {
      const mockPromise = Promise.resolve(posts);
      const get = jest.fn(() => mockPromise);
      const tag = "Algorithms";

      await act(async () => {
        render(
          <MemoryRouter>
            <Posts tag={tag} get={get} />
          </MemoryRouter>,
          container
        );
      });

      expect(get).toHaveBeenCalledWith(
        `/api/posts?tag=${tag}`,
        expect.anything()
      );
    });

    it("displays error message for failed request", async () => {
      const mockPromise = Promise.reject(new RequestError(500, "Server Error"));
      const get = jest.fn(() => mockPromise);

      await act(async () => {
        render(
          <MemoryRouter>
            <Posts get={get} />
          </MemoryRouter>,
          container
        );
      });
      expect(container.querySelectorAll(".error")).toHaveLength(1);
    });
  });
});
