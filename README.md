# bfdes.in

![GitHub Actions](https://github.com/bfdes/bfdes.github.io/workflows/Test/badge.svg)
[![Codecov](https://codecov.io/gh/bfdes/bfdes.github.io/branch/master/graph/badge.svg)](https://codecov.io/gh/bfdes/bfdes.github.io)

Source for my personal blog.

## Usage

### Requirements

- [NodeJS](https://nodejs.org/en/) 14.x
- [Yarn](https://classic.yarnpkg.com) 1.x

Run the following commands within the repository root:

```bash
yarn install
# Installs all dependencies

yarn build:project
# Builds the static site generator, and puts it in ssg.js

yarn build:site
# Builds the website itself, and puts it in site/
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

### Supported syntax

[KaTeX](https://katex.org) and [highlight.js](https://highlightjs.org) rendering plugins from the [unified.js](https://unifiedjs.com) ecosystem enable rendering of math, code:

- Wrap inline math in `$`, and block math in `$$`
- Wrap code in ` ``` `

For example, the snippet

````
# Complex numbers

Python supports complex numbers natively. For example, $1 + 2*j$ is written as

```python
1 + 2j
```
````

illustrates the use of inline math, delimited by `$`, and fenced code blocks, delimited by ` ``` `.

### Testing

Run the following commands to lint, format and test code, respectively:

```plaintext
yarn lint
yarn format
yarn test
```

[GitHub Actions](https://github.com/bfdes/bfdes.github.io/actions) will also run tests for every code push.

## Deployment

The output of `yarn build` can be

1. served by a webserver such as [NGINX](https://www.nginx.com/), or
2. hosted by a platform like [GitHub Pages](https://pages.github.com/).
