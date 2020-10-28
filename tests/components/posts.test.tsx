import { mount } from "enzyme";
import * as React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { Posts } from "shared/components";
import { Context } from "shared/containers";
import { withTag } from "shared/hocs";
import { RequestError } from "shared/http";

test("withTag", () => {
  const tag = "Python";
  const WithTag = withTag(({ tag }) => <>{tag}</>);
  const wrapper = mount(
    <MemoryRouter initialEntries={[`/posts?tag=${tag}`]}>
      <Routes>
        <Route path="posts" element={<WithTag />} />
      </Routes>
    </MemoryRouter>
  );
  expect(wrapper.text()).toBe(tag);
});

// `Posts` instance is wrapped in a `MemoryRouter` because we render `Link`s when mount is invoked
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

  describe("<Posts /> on server", () => {
    beforeAll(() => {
      global.__isBrowser__ = false;
    });

    it("displays posts", () => {
      const wrapper = mount(
        <MemoryRouter>
          <Context.Posts.Provider value={posts}>
            <Posts get={jest.fn()} />
          </Context.Posts.Provider>
        </MemoryRouter>
      );
      expect(wrapper.find(".post")).toHaveLength(posts.length);
    });

    it("asks the reader to return", () => {
      const wrapper = mount(
        <MemoryRouter>
          <Context.Posts.Provider value={[]}>
            <Posts get={jest.fn()} />
          </Context.Posts.Provider>
        </MemoryRouter>
      );
      expect(wrapper.find(".error")).toHaveLength(1);
    });
  });

  describe("<Posts /> on client", () => {
    beforeAll(() => {
      global.__isBrowser__ = true;
    });

    it("displays posts", () => {
      const mockPromise = Promise.resolve(posts);
      const get = jest.fn(() => mockPromise);

      const wrapper = mount(
        <MemoryRouter>
          <Posts get={get} />
        </MemoryRouter>
      );
      return mockPromise.then(() => {
        expect(wrapper.update().find(".post")).toHaveLength(posts.length);
      });
    });

    it("asks the reader to return", () => {
      const mockPromise = Promise.resolve([]);
      const get = jest.fn(() => mockPromise);

      const wrapper = mount(
        <MemoryRouter>
          <Posts get={get} />
        </MemoryRouter>
      );
      return mockPromise.then(() => {
        expect(wrapper.update().find(".error")).toHaveLength(1);
      });
    });

    it("fetches posts with the correct tag", () => {
      const mockPromise = Promise.resolve(posts);
      const get = jest.fn(() => mockPromise);
      const tag = "Algorithms";

      mount(
        <MemoryRouter>
          <Posts tag={tag} get={get} />
        </MemoryRouter>
      );
      return mockPromise.then(() => {
        expect(get).toHaveBeenCalledWith(
          `/api/posts?tag=${tag}`,
          expect.anything()
        );
      });
    });

    it("displays error message for failed request", () => {
      const mockPromise = Promise.reject(new RequestError(500, "Server Error"));
      const get = jest.fn(() => mockPromise);

      const wrapper = mount(
        <MemoryRouter>
          <Posts get={get} />
        </MemoryRouter>
      );
      return mockPromise
        .then(() => {
          // Ref. https://github.com/airbnb/enzyme/issues/450#issuecomment-341244926
        })
        .catch(() => {
          expect(wrapper.update().find(".error")).toHaveLength(1);
        });
    });
  });
});
