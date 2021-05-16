---
title: Extending React
tags: [Compilers, JSX]
created: 2021-05-12
summary: Extending React's JSX API
---

Facebook's JavaScript user interface library ReactJS has taken the world of frontend development [by storm](https://trends.google.com/trends/explore?date=2013-01-01%202021-01-01&q=%2Fm%2F012l1vxv) since its public introduction at [JSConf 2013](https://www.youtube.com/watch?v=GW0rj4sNH2w).

Unlike the Model-View frameworks that preceeded it, React drives UI updates by one-way data flow and declarative state management. Controversially, React introduced an XML-like syntax extension to JavaScript called [JSX](https://reactjs.org/docs/introducing-jsx.html) so that developers could combine markup syntax and render logic in application code.

The idioms React promoted were not intially well-received, but they have gone on to become the norm.

We are going to ~abuse~ extend React's JSX API to create a small NodeJS library that can be used in scripts to build a static website through declarative composition of `File` and `Dir` primitives.

For example, part of this blog can be described by the following static router:

```jsx
const router = (
  <Dir name="site">
    <File name="index.html">
      <PostList posts={posts} />
    </File>
    <Dir name="posts">
      {posts.map((post) => (
        <File name={`${post.slug}.html`} key={post.slug}>
          <Post {...post} />
        </File>
      ))}
    </Dir>
  </Dir>
);
```

`router.write(__dirname)` writes the site to disk, mounting the files

```shell
site
  ├── index.html
  └── posts
      └── extending-react.html
```

in the directory where `write` was invoked.

## Understanding React

A minimal understanding of how React works is required to extend its API. Lets review some concepts.

### Components and Elements

React applications are comprised of template entities called components.

They can be declared with a class or with a function.[^1] For example, the following two ways of declaring a `Welcome` component that greets a user are equivalent:

```jsx
// Class component
class Welcome extends React.Component {
  render() {
    return <div>Hello, {this.props.name}</div>;
  }
}

// Function component
const Welcome = ({ name }) => <div>Hello, {name}</div>;
```

`Welcome` accepts a `name` property or "prop" as input, which tells it who it should greet.

Elements can be regarded as instances of components; they can be rendered to the DOM in a browser:

```jsx
const node = <Welcome name="Scully" />; // Instance of `Welcome` created with JSX
ReactDOM.render(node, document.getElementById("root"));
```

, or as a string on a server:

```jsx
renderToStaticMarkup(<Welcome name="Mulder" />);
```

Note that function components and the `render` method of class components can themselves return elements. This is not a coincidence!

### Composition and Children

React promotes code encapsulation and resuse through composition rather than inheritance.

The `children` prop of a component has access to the children passed to it; this can be used to render generic components that do not know their children ahead of time. For example, a `Page` component can be used to add a common header to all the pages of a website:

```jsx
const Page = ({ children }) => (
  <html lang="en">
    <Head />
    <Body>{children}</Body>
  </html>
);

// Usage example:
const About = () => (
  <Page>
    <div className="about">
      <h1>About</h1>
      <p>
        Hello, my name is Bruno Fernandes, and I write code for fun and profit.
      </p>
    </div>
  </Page>
);
```

### Desugaring JSX

React cannot be used without first preprocessing or transpiling JSX to plain JavaScipt.

During transpilation, build tools such as [Babel](https://babeljs.io/) and [esbuild](https://esbuild.github.io/) transform any JSX tags they encounter to calls to a pragma or directive. Historically, the pragma was `React.createElement`, but build tools made the pragma configurable to accommodate more frameworks that support JSX.

For example, the script

```jsx
import React from "react";

const Welcome = ({ name }) => <div>Hello, {name}</div>;

renderToStaticMarkup(<Welcome name="Mulder" />);
```

could be transformed into

```jsx
import React from "react";

const Welcome = ({ name }) => React.createElement("div", null, "Hello, ", name);

renderToStaticMarkup(React.createElement(Welcome, { name: "Mulder" }));
```

by the first stage of a transpiler for React.

From looking at how the pragma is invoked we can learn about its expected signature:

- First parameter: JSX element type. A string for lowercase types, a reference for uppercase ones.[^2]
- Second parameter: An object keyed by props being passed to the element.
- The rest of the parameters are populated with transformed child elements.

Also note that the `React` object must be in scope wherever JSX is used.[^3]

## Building the library

We can exploit a user-customisable JSX transform and what we've seen of React's composition model to implement our API. The idea is simple: calls to `File` or `Dir` "components" should be intercepted and recast as instantiations of filesystem objects. These objects must know how to recursively write their contents to disk.

### The filesystem abstraction

Observe that files and directories on disk can be modelled as trees where files form the terminal nodes. Any file or directory should be able to write its contents to disk then, when given a root path to mount to.

`FileSystem` forms the notion of this interface for files and directories:

```js
class NotImplementedError extends Error {}

class FileSystem {
  constructor(name, content) {
    this.name = name;
    this.content = content;
  }

  write(rootPath) {
    throw new NotImplementedError(); // Runtime interface emulation
  }
}
```

, and `File` and `Dir` implement the write behaviour:

```js
import path from "path";
import fs from "fs";

class FileWriteError extends Error {
  constructor(filePath, ...args) {
    const msg = `Could not write to ${filePath}`;
    super(msg, ...args);
  }
}

class File extends FileSystem {
  write(rootPath) {
    const filePath = path.join(rootPath, this.name);
    try {
      fs.writeFileSync(filePath, this.content);
    } catch (_) {
      throw new FileWriteError(filePath);
    }
  }
}

class Dir extends FileSystem {
  write(rootPath) {
    const dirPath = path.join(rootPath, this.name);
    try {
      // Create the directory if it does not exist
      fs.mkdirSync(dirPath, { recursive: true });
    } catch (_) {
      throw new FileWriteError(dirPath);
    }
    for (const fileOrDir of this.content) {
      this.write(dirPath, fileOrDir); // recurse
    }
  }
}
```

If a call to `write` fails for whatever reason, a partial write will occur. This is acceptable -- subsequent runs of the static site generator will overwrite content and remediate the problem.

### Hijacking the JSX transform

We tell the build tool to transform JSX tags using our _own_ pragmas:

1. JSX elements should call `Template.createElement`, and
2. JSX fragments should expand to reference `Template.Fragment`.[^4]

In Babel this looks like

```js
// babel.config.js
module.exports = {
  presets: [
    [
      "@babel/preset-react",
      {
        pragma: "Template.createElement",
        pragmaFrag: "Template.Fragment",
      },
    ],
  ],
};
```

Then we export some stub `File` and `Dir` components for the user to reference:

```jsx
export const File = () => <></>; // no-op
export const Dir = () => <></>; // no-op
```

Our JSX transformer `createElement` should intercept any `File` or `Dir` stub references and delegate all other calls to React:

```jsx
const Template = {
  createElement(type, props, ...children) {
    if (type == Dir) {
      return createDir(props, children);
    }
    if (type == File) {
      return createFile(props, children);
    }
    return React.createElement(type, props, ...children);
  },
  Fragment: React.Fragment, // An alias for developer convenience
};
```

`createDir` verfies that all children are `FileSystem` instances before creating a `Dir`:

```jsx
class RoutingError extends Error {}

function createDir(props, children) {
  // Trivial input verification omitted
  const { name } = props;
  children = children.flat();

  if (!children.every((c) => c instanceof FileSystem)) {
    const msg = `Children of directory ${name} must be directory or file elements`;
    throw new RoutingError(msg);
  }
  return new Dir(name, children);
}
```

`createFile` verfies that there is only one child before creating a `File`:

```jsx
function createFile(props, children) {
  // Trivial input verification omitted
  const { name } = props;

  if (children.length != 1) {
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
```

That is as much as we need to successfully use the library!

However, there are a couple of improvements that can be made:

1. Children should be prevented from being passed as `props.children` to `File` and `Dir`.
2. `FileSystem.write` implementations should use the promise-based Node filesystem API.

The ESLint React plugin regards passing children directly through props as [a bad practice](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-children-prop.md). It leads to quirks when children are _also_ passed through composition, as the transpiler discards `props.children` when calling the pragma. The best we can do is warn the user:

```js
// In createDir
if (props.children) {
  const msg = `Contents of directory ${name} must be passed as nested children`;
  throw new RoutingError(msg); // Why would anyone do this?
}
// In createFile
if (props.children) {
  const msg = `Contents of file ${name} must be passed as nested children`;
  throw new RoutingError(msg); // Why would anyone do this?
}
```

Reading and writing files asynchronously is obviously more efficient than doing it synchronously, but the difference is only noticeable when we are running a program on a busy webserver. Using a script to build a website only taxes a machine briefly.

[^1]: Prior to the introduction of [React Hooks](https://reactjs.org/docs/hooks-intro.html) in React 16.8, class and function components served different purposes. Now that function components can also manipulate internal state through hooks, class components are somewhat redundant.
[^2]: In practice this means that user-defined React components must always be named with a capital letter, or be assigned to a capitalised variable before use.
[^3]: Since the release of React 17, many transpilers [are able to "automatically import" React](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html).
[^4]: Fragments allow components to return multiple elements without adding extra nodes to the DOM.