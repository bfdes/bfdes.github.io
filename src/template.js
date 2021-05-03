import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as Components from "./components";
import { File, Dir, FileSystem } from "./fs";

class IllegalArgumentException extends Error {}

const isString = (maybeStr) =>
  typeof maybeStr === "string" || maybeStr instanceof String;

function createDir(props, childArray) {
  const { name } = props;
  const children = childArray.flat() || props.children.flat();

  if (!isString(name)) {
    const msg = "Directory name must be a string";
    throw new IllegalArgumentException(msg);
  }
  if (!children.every((c) => c instanceof FileSystem)) {
    const msg = `Children of directory ${name} must be directory or file elements`;
    throw new IllegalArgumentException(msg);
  }
  return new Dir(name, children);
}

function createFile(props, childArray) {
  const { name } = props;
  const children = childArray.flat() || props.children.flat();

  if (!isString(name)) {
    const msg = "File name must be a string";
    throw new IllegalArgumentException(msg);
  }
  if (children.length != 1) {
    const msg = `File ${name} must have a single child element or string`;
    throw new IllegalArgumentException(msg);
  }

  const [contents] = children;

  if (isString(contents)) {
    return new File(name, contents);
  }
  if (React.isValidElement(contents)) {
    const page = `<!DOCTYPE html>${renderToStaticMarkup(contents)}`;
    return new File(name, page);
  }
}

export default {
  createElement: function (type, props, ...children) {
    if (type == Components.Dir) {
      return createDir(props, children);
    }
    if (type == Components.File) {
      return createFile(props, children);
    }
    return React.createElement(type, props, ...children);
  },
  Fragment: React.Fragment,
};
