import Template, { RoutingError } from "src/template";
import { File, Dir } from "src/components";
import { mk } from "src/fileSystem";
import React from "react";

describe("Template.createElement", () => {
  it("creates files", () => {
    const name = "hello-world.html";
    const contents = "Hello, World!";
    const elem = <File name={name}>{contents}</File>;

    expect(elem).toEqual(mk(name, contents));
  });

  it("creates directories", () => {
    const elem = (
      <Dir name="posts">
        <File name="hello-world.html">Hello, World!</File>
      </Dir>
    );
    expect(elem).toEqual(
      mk("posts", [mk("hello-world.html", "Hello, World!")])
    );
  });

  it("creates empty directories", () => {
    const elem = <Dir name="posts" />;

    expect(elem).toEqual(mk("posts", []));
  });

  it("delegates to React.createElement", () => {
    const HelloWorld = () => <>Hello, World!</>;
    const elem = <HelloWorld />;

    expect(elem).toEqual(React.createElement(HelloWorld));
  });
});

describe("File", () => {
  it("adds DOCTYPE to React element children", () => {
    const name = "hello-world.html";
    const HelloWorld = () => <>Hello, World!</>;
    const elem = (
      <File name={name}>
        <HelloWorld />
      </File>
    );
    const contents = "<!DOCTYPE html>Hello, World!";

    expect(elem).toEqual(mk(name, contents));
  });

  it("requires name prop", () => {
    const contents = "Hello, World!";

    expect(() => <File>{contents}</File>).toThrow(RoutingError);

    expect(() => <File name={1}>{contents}</File>).toThrow(RoutingError);
  });

  it("requires contents", () =>
    expect(() => <File name="hello-world.html" />).toThrow(RoutingError));
});

describe("Dir", () => {
  it("requires name prop", () => {
    expect(() => (
      <Dir>
        <File name="hello-world.html">Hello, World!</File>
      </Dir>
    )).toThrow(RoutingError);

    expect(() => (
      <Dir name={1}>
        <File name="hello-world.html">Hello, World!</File>
      </Dir>
    )).toThrow(RoutingError);
  });

  it("requires FileSystem element contents", () =>
    expect(() => <Dir name="posts">Hello, World!</Dir>).toThrow(RoutingError));
});
