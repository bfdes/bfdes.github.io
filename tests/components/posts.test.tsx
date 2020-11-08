import * as React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { Posts } from "shared/components";
import { Context } from "shared/containers";
import { withTag } from "shared/hocs";

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
      <Routes basename="posts">
        <Route element={<WithTag />} />
      </Routes>
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

    it("asks the reader to return when therer are no posts", () => {
      act(() => {
        render(
          <MemoryRouter>
            <Context.Posts.Provider value={[]}>
              <Posts />
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

    afterEach(() => {
      global.fetch.mockRestore();
    });

    it("renders posts", async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(posts),
        })
      );

      await act(async () => {
        render(
          <MemoryRouter>
            <Posts />
          </MemoryRouter>,
          container
        );
      });

      expect(container.querySelectorAll(".post")).toHaveLength(posts.length);
    });

    it("renders posts with the correct tag", async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(posts),
        })
      );
      const tag = "Algorithms";

      await act(async () => {
        render(
          <MemoryRouter>
            <Posts tag={tag} />
          </MemoryRouter>,
          container
        );
      });

      expect(fetch).toHaveBeenCalledWith(
        `/api/posts?tag=${tag}`,
        expect.anything()
      );
    });

    it("asks the user to return when there are no posts", async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      );

      await act(async () => {
        render(
          <MemoryRouter>
            <Posts />
          </MemoryRouter>,
          container
        );
      });
      expect(container.querySelectorAll(".error")).toHaveLength(1);
    });

    it("renders error message for failed request", async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () =>
            Promise.resolve({
              error: { message: "500: Internal Server error" },
            }),
        })
      );

      await act(async () => {
        render(
          <MemoryRouter>
            <Posts />
          </MemoryRouter>,
          container
        );
      });
      expect(container.querySelectorAll(".error")).toHaveLength(1);
    });
  });
});
