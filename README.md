# bfdes.in

![GitHub Actions](https://github.com/bfdes/bfdes.in/workflows/Test/badge.svg)
[![Codecov](https://codecov.io/gh/bfdes/bfdes.in/branch/master/graph/badge.svg)](https://codecov.io/gh/bfdes/bfdes.in)

Source for my personal blog, built using React SSR and written in TypeScript.

The Blog is edited by supplying Markdown documents with YAML frontmatter in a posts directory beneath the root.

When the server-side code is built, the posts are bundled using a custom Webpack loader.

## Requirements

- [Node.js](https://nodejs.org/en/) 14.x
- [Yarn](https://classic.yarnpkg.com) 1.x

## Usage

### Installation

Run `yarn install` within the root directory.

### Local development

Run `yarn build:dev`. Uses Webpack in watch mode to compile the TS source for both the frontend and the backend.

Write posts in a 'posts' folder under the root directory. The format is

```
---
title: <TITLE>
tags: <TAG1> <TAG2>
created: <YEAR>-<MONTH>-<DAY>
summary: <RSS SUMMARY>
---
<BODY IN MARKDOWN>
```

and the name of the markdown file should correspond to the slug of its post.

Then (also) run `yarn serve:dev` to serve the app on port 8080 using Nodemon.

### Testing

Run the following commands to lint, format and test code, respectively:

```plaintext
 yarn lint
 yarn format
 yarn test
```

GitHub Actions will also run tests for every code push.

## Deployment

Running `yarn build:prod` generates two bundles

- Client code under the /static folder
- A single file of server-side code

Run the server-side code using Node.js, and optionally configure a webserver to serve assets under /static.
