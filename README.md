# bfdes.in

![GitHub Actions](https://github.com/bfdes/bfdes.in/workflows/Test/badge.svg)
[![Codecov](https://codecov.io/gh/bfdes/bfdes.in/branch/master/graph/badge.svg)](https://codecov.io/gh/bfdes/bfdes.in)

Source for my personal blog as well as the simple static site generator used to build it.

In this repo,

- `src` contains source code for the static site generator, and
- `posts`, `images`, `styles` contain the markup and assets for the website.

## Usage

### Requirements

- [Node.js](https://nodejs.org/en/) 14.x
- [Yarn](https://classic.yarnpkg.com) 1.x (to build the static site generator)

Run the following commands within the repository root:

```bash
yarn install
# Installs all dependencies

yarn compile:prod
# Builds the static site generator, and puts it in dist/ssg.js

yarn build:prod
# Builds the website itself, and puts it in site/
```

Example output:

```
site
├── 404.html
├── about.html
├── feed.rss
├── images
│   └── favicon.png
├── index.html
├── posts
│   └── hello-world.html
├── styles
│   └── main.css
└── tags
    └── python.html
```

### Editing posts

Enter Markdown articles in the posts directory with the following structure:

```
---
title: <TITLE>
tags: <TAG1> <TAG2>
created: <YEAR>-<MONTH>-<DAY>
summary: <RSS SUMMARY>
---
<BODY IN MARKDOWN>
```

The name of the markdown file should correspond to the slug of its post.

For example, `hello-world.md` will be transformed into `site/posts/hello-world.html`.

### Supported syntax

[KaTeX](https://katex.org) and [highlight.js](https://highlightjs.org) rendering plugins from the [unified.js](https://unifiedjs.com) ecosystem enable rendering of math, code:

- Wrap inline math in `$`, and block math in `$$`
- Wrap code in ` ``` ` (add newlines for block code)

For example, the snippet

````
# Complex numbers

Python supports complex numbers natively. For example, $1 + 2*j$ is written as

```python
1 + 2j
```
````

illustrates the use of inline math, delimited by `$`, and fenced code blocks, delimited by ` ``` `.

### Editing styles and assets

Styles and assets are simply copied over by the static site generator:

- `styles/main.css` modifies the appearence of the generated website, and
- images are fetched relative to the `images` folder.

## Local development

Run `yarn compile:dev` and `yarn build:dev` in separate terminal windows to

- build the site quickly for rapid developer iteration, and
- rebuild the site in response to changes in source code and markup.

You can use any of the built-in webservers that come with various interpreted languages to view the website.

Using [Ruby's WEBRick](https://github.com/ruby/webrick), for example:

```bash
ruby -run -ehttpd site  # serves the contents of site on localhost, port 8080
```

### Testing

Run the following commands to lint, format and test code, respectively:

```plaintext
yarn lint
yarn format
yarn test
```

GitHub Actions will also run tests for every code push.
