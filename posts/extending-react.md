---
title: Extending React
tags: [Compilers, JSX]
created: 2021-05-12
summary: Extending React's JSX API
---

Facebook's JavaScript user interface library ReactJS has taken the world of frontend development [by storm](https://trends.google.com/trends/explore?date=2013-05-29%202021-01-01&q=%2Fm%2F012l1vxv) since its public introduction at [JSConf 2013](https://www.youtube.com/watch?v=GW0rj4sNH2w).

Unlike the Model-View frameworks that preceded it, React drives UI updates by declarative state management. Controversially, React introduced an XML-like syntax extension to JavaScript called [JSX](https://reactjs.org/docs/introducing-jsx.html) so developers could combine markup syntax and render logic in application code.

The idioms React promoted were not initially well-received, but they have gone on to become popular.

We will extend React's JSX API to create a small NodeJS library that can be used in scripts to build a static website through the declarative composition of `File` and `Dir` primitives.

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

In this way, anyone can roll their own React-based static site generator like [Gatsby](https://www.gatsbyjs.com/).

## Understanding React

A minimal understanding of how React works is required to extend its API. Let's review some concepts.

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

Note that function components and the `render` method of class components can themselves return elements -- this is not a coincidence!

### Composition and Children

React promotes code encapsulation and reuse through composition rather than inheritance.

The `children` prop of a component has access to the children passed to it; this can be used to render generic components that do not know their children ahead of time. For example, a `Page` component can be used to add a common header to every page of a website:

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

Browsers and Node cannot understand JSX, so it must be transpiled to plain JavaScript before use.

During transpilation, build tools such as [Babel](https://babeljs.io/) and [esbuild](https://esbuild.github.io/) transform any JSX tags they encounter to calls to a JSX factory function. Historically, the factory was `React.createElement`, but build tools made the factory configurable using a pragma or transpiler directive to accommodate more frameworks that support JSX.

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

by the first stage of a preprocessor or transpiler for React.

From looking at how `React.createElement` is invoked, we can learn about the expected signature for the factory function:

- First parameter: JSX element type. A string for lowercase types, a reference for uppercase ones.[^2]
- Second parameter: An object keyed by props passed to the element.
- The rest of the parameters are populated with transformed child elements.

Also, note that the `React` object must be in scope wherever JSX is used.[^3]

## Writing the library

We can exploit a user-customisable JSX transform and what we've seen of React's composition model to implement our API. The idea is simple: calls to `File` or `Dir` "components" should be intercepted and recast as instantiations of filesystem objects. These objects must know how to write their contents to disk recursively.

### The filesystem abstraction

Observe that we can model files and directories on disk as trees where files form the terminal nodes. Any file or directory should be able to write its contents to disk when given a root path.

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

`File` and `Dir` implement the write behaviour:

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
      fileOrDir.write(dirPath); // recurse
    }
  }
}
```

If a call to `write` fails for whatever reason, a partial write will occur. This is acceptable -- subsequent runs of the static site generator will overwrite content and remediate the problem.

### Hijacking the JSX transform

We tell the build tool to transform JSX tags using our _own_ factories:

1. JSX elements should call `Template.createElement`, and
2. JSX fragments should expand to reference `Template.Fragment`.[^4]

In Babel, this looks like

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

```js
const Template = {
  createElement(type, props, ...children) {
    if (type === Dir) {
      return createDir(props, children);
    }
    if (type === File) {
      return createFile(props, children);
    }
    return React.createElement(type, props, ...children);
  },
  Fragment: React.Fragment, // An alias for developer convenience
};
```

`createDir` verifies that all children are `FileSystem` instances before creating a `Dir`:

```js
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

`createFile` verifies that there is only one child before creating a `File`:

```js
function createFile(props, children) {
  // Trivial input verification omitted
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
```

That is as much as we need to use the library successfully!

### Cleaning up

There are a couple of improvements that we can make:

1. `createElement` should prevent children from being passed as `props.children`.
2. `FileSystem.write` implementations could use the promise-based Node filesystem API.

Passing children directly through props is discouraged.[^5] It leads to quirks when children are _also_ passed through composition, as the transpiler discards `props.children` when calling the JSX factory.

We can add the following block to `createDir` and `createFile` to prevent developers from passing children directly to `Dir` or `File`:

```js
if (props.children) {
  const msg = `Contents of ${name} must be passed as nested children`;
  throw new RoutingError(msg); // Why would anyone do this?
}
```

Code like

```jsx
<File name="about.html" children={<About />} /> // Not OK
```

will throw when executed.

Using callback or promise-based Node APIs to write directories and files asynchronously means we can ask the operating system to try writing all the children of a directory at once. Currently, we wait for one child to be written before we start writing the next one.[^6]

The simplest way to make the change is to use `async`-`await` syntax:

```js
import fs from "fs/promises";

class File extends FileSystem {
  async write(rootPath) {
    const filePath = path.join(rootPath, this.name);
    try {
      await fs.writeFile(filePath, this.content);
    } catch (_) {
      throw new FileWriteError(filePath);
    }
  }
}

class Dir extends FileSystem {
  async write(rootPath) {
    const dirPath = path.join(rootPath, this.name);
    try {
      // Write the parent directory first,
      await fs.mkdir(dirPath, { recursive: true });
    } catch (_) {
      throw new FileWriteError(dirPath);
    }
    // and then all the children at once
    await Promise.all(
      this.content.map((fileOrDir) => fileOrDir.write(dirPath))
    );
  }
}
```

If you can afford to, it is best to avoid concurrent programming.

[^1]: Before the introduction of [React Hooks](https://reactjs.org/docs/hooks-intro.html) in React 16.8, class and function components served different purposes. Now that function components can also manipulate React state through hooks, class components are somewhat redundant.
[^2]: In practice, this means that user-defined React components must be named with a capital letter or be assigned to a capitalised variable before use.
[^3]: Since the release of React 17, many transpilers [can "automatically import" React](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html).
[^4]: Fragments allow components to return multiple elements without adding extra nodes to the DOM.
[^5]: This bad practice can be identified during linting; by default, the ESLint React plugin [stops](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-children-prop.md) children from being passed directly through props.
[^6]: Building a website from a script only taxes a machine briefly anyway, so the difference in runtime shouldn't be noticeable.
