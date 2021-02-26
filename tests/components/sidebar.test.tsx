import * as React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import { Sidebar } from "src/components";

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
});

describe("<Sidebar />", () => {
  it("renders links", () => {
    act(() => {
      render(<Sidebar />, container);
    });
    const links = Array.from(container.querySelectorAll("a")).map(
      (l) => l.href
    );
    expect(links).toContain("http://localhost/posts"); // JSDOM host
    expect(links).toContain("http://localhost/about.html");
    expect(links).toContain("https://www.github.com/bfdes");
    expect(links).toContain("http://localhost/feed.rss");
  });
});
