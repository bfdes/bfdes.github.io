import * as React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import { About, Page } from "src/components";

let container: HTMLHtmlElement;

beforeEach(() => {
  container = document.createElement("html");
  document.body.appendChild(container);
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
});

describe("<Page />", () => {
  it("renders sidebar", () => {
    act(() => {
      render(
        <Page>
          <About />
        </Page>,
        container
      );
    });
    expect(container.querySelectorAll("#sidebar")).toHaveLength(1);
  });

  it("renders content", () => {
    act(() => {
      render(
        <Page>
          <About />
        </Page>,
        container
      );
    });
    expect(container.querySelectorAll("#content")).toHaveLength(1);
  });
});
