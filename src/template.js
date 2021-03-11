import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import fs from "fs";
import path from "path";
import * as Components from "./components";

class File {
  constructor(name, contents) {
    this.name = name;
    this.contents = contents;
  }

  write(rootPath) {
    const filePath = path.join(rootPath, this.name);
    try {
      fs.writeFileSync(filePath, this.contents);
    } catch (_) {
      console.error(`Could not write to ${filePath}`)
    }
  }
}

class Dir {
  constructor(name, contents) {
    this.name = name;
    this.contents = contents;
  }

  write(rootPath) {
    const dirPath = path.join(rootPath, this.name);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
    this.contents.forEach((file) => file.write(dirPath));
  }
}

export default {
  createElement: function (type, props, ...children) {
    // Pass depth to error? 
    if (type == Components.Dir) {
      const flattenedChildren = children.flat()
      if(!flattenedChildren.every(c => c instanceof Dir || c instanceof File)) {
        const msg = `Children of <Dir name=${props.name}> must be directory or file elements`
        console.error(msg)
        process.exit(1)
      }
      return new Dir(props.name, flattenedChildren);
    }
    if (type == Components.File) {
      if(!children.every(React.isValidElement)) {
        const msg = `Children of <File name=${props.name}> must be ordinary React elements`
        console.error(msg)
        process.exit(1)
      }
      const page = `<!DOCTYPE html>${renderToStaticMarkup(children)}`;
      return new File(props.name, page);
    }
    return React.createElement(type, props, ...children);
  },
  createFragment: React.Fragment,
};
