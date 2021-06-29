import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as Components from "./components";
import { Dir, File, FileSystem } from "./fileSystem";
import isString from "./isString";

export class RoutingError extends Error {}

function createDir(props, children) {
  if (props === null) {
    throw new RoutingError("Directories must be named");
  }

  if (!isString(props.name)) {
    throw new RoutingError("Directory names must be strings");
  }

  const { name } = props;
  children = children.flat();

  if (!children.every((c) => c instanceof FileSystem)) {
    const msg = `Children of directory ${name} must be directory or file elements`;
    throw new RoutingError(msg);
  }
  return new Dir(name, children);
}

function createFile(props, children) {
  if (props === null) {
    throw new RoutingError("Files must be named");
  }

  if (!isString(props.name)) {
    throw new RoutingError("File names must be a strings");
  }

  const { name } = props;

  if (children.length !== 1) {
    const msg = `File ${name} must have a single child element or string`;
    throw new RoutingError(msg);
  }

  const [content] = children;

  if (React.isValidElement(content)) {
    const page = `<!DOCTYPE html>${renderToStaticMarkup(content)}`;
    return new File(name, page);
  }
  return new File(name, content); // `content` must be a string
}

export default {
  createElement(type, props, ...children) {
    if (type === Components.Dir) {
      return createDir(props, children);
    }
    if (type === Components.File) {
      return createFile(props, children);
    }
    return React.createElement(type, props, ...children);
  },
  Fragment: React.Fragment,
};
