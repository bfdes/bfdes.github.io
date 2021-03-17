import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as Components from "./components";
import { File, Dir } from "./fs";

export default {
  createElement: function (type, props, ...children) {
    // Pass depth to error?
    if (type == Components.Dir) {
      const flattenedChildren = children.flat();
      if (
        !flattenedChildren.every((c) => c instanceof Dir || c instanceof File)
      ) {
        const msg = `Children of <Dir name=${props.name}> must be directory or file elements`;
        console.error(msg);
        process.exit(1);
      }
      return new Dir(props.name, flattenedChildren);
    }
    if (type == Components.File) {
      if (!children.every(React.isValidElement)) {
        const msg = `Children of <File name=${props.name}> must be ordinary React elements`;
        console.error(msg);
        process.exit(1);
      }
      const page = `<!DOCTYPE html>${renderToStaticMarkup(children)}`;
      return new File(props.name, page);
    }
    return React.createElement(type, props, ...children);
  },
  Fragment: React.Fragment,
};
