import Template from "src/template"
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import { PaginationLink } from "src/components";

let container;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
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
