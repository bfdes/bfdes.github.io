import * as React from "react";
import Sidebar from "./Sidebar";

const Head: React.FC = () => (
  <head>
    <meta charSet="utf8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#202020" />
    <meta name="description" content="Personal blog" />
    <meta name="author" content="Bruno Fernandes" />
    <title>bfdes.in</title>
    <link href="/images/favicon.png" rel="icon" />
    <link
      href="https://fonts.googleapis.com/css?family=Roboto|Roboto+Mono&amp;display=swap"
      rel="stylesheet"
    />
    <link
      href="https://unpkg.com/highlight.js@10.3.1/styles/github.css"
      rel="stylesheet"
    />
    <link
      href="https://unpkg.com/katex@0.12.0/dist/katex.min.css"
      rel="stylesheet"
    />
    <link href="/styles/main.css" rel="stylesheet" />
  </head>
);

const Body: React.FC = ({ children }) => (
  <body>
    <div id="root">
      <Sidebar />
      <div id="content">{children}</div>
    </div>
  </body>
);

const Page: React.FC = ({ children }) => (
  <>
    <Head />
    <Body>{children}</Body>
  </>
);

export default Page;
