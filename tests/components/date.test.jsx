import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import Date from "src/components/Date";
import Template from "src/template";

let container;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
});

describe("<Date />", () => {
  it("renders current time", () => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const now = new global.Date();

    const day = now.getDate();
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();

    act(() => {
      render(<Date value={now} />, container);
    });
    expect(container.textContent).toBe(`${day} ${month} ${year}`);
  });
});
