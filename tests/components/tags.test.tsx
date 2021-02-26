import * as React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { TagList } from "src/components";

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
});

describe("<TagList />", () => {
  it("renders empty span for a post with no tags", () => {
    // Edge case
    act(() => {
      render(<TagList tags={[]} />, container);
    });
    expect(container.querySelectorAll("a")).toHaveLength(0);
  });

  it("renders a single tag", () => {
    // Edge case
    const tags = ["Algorithms"];
    act(() => {
      render(<TagList tags={tags} />, container);
    });
    expect(container.querySelectorAll("a")).toHaveLength(1);
  });

  it("renders multiple tags", () => {
    const tags = ["Algorithms", "Python"];
    act(() => {
      render(<TagList tags={tags} />, container);
    });
    expect(container.querySelectorAll("a")).toHaveLength(tags.length);
  });
});

describe("<Tag />", () => {
  it("navigates to the correct route when clicked", () => {
    const tags = ["Algorithms", "Python"];

    act(() => {
      render(<TagList tags={tags} />, container);
    });
    const [link1, link2] = Array.from(container.querySelectorAll("a")).map(
      (l) => l.href
    );
    expect(link1).toMatch(/\/tags\/algorithms.html$/);
    expect(link2).toMatch(/\/tags\/python.html$/);
  });
});
