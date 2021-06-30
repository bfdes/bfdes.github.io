import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import remarkFootnotes from "remark-footnotes";
import remarkGFM from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import unified from "unified";
import { VFile } from "vfile";
import { matter } from "vfile-matter";
import isString from "./isString";
import slugify from "./slugify";

const schema = {
  title: isString,
  summary: isString,
  tags: (value) => Array.isArray(value) && value.every(isString),
  created: (value) => value instanceof Date, // Good enough for use-case
};

export class MissingMetadataError extends Error {
  constructor(...args) {
    const msg = "Markup is missing metadata";
    super(msg, ...args);
  }
}

export class MissingMetadataKeysError extends Error {
  constructor(keys, ...args) {
    const msg = `Metadata keys ${keys.join(", ")} could not be found`;
    super(msg, ...args);
  }
}

export class MetadataParseError extends Error {
  constructor(keys, ...args) {
    const msg = `Metadata keys ${keys.join(", ")} could not be parsed`;
    super(msg, ...args);
  }
}

function validate(meta) {
  if (meta === "undefined") {
    throw new MissingMetadataError();
  }
  const schemaKeys = Object.keys(schema);

  const missingKeys = schemaKeys.filter((key) => !(key in meta));
  if (missingKeys.length) {
    throw new MissingMetadataKeysError(missingKeys);
  }

  const malformedKeys = schemaKeys.filter((key) => !schema[key](meta[key]));
  if (malformedKeys.length) {
    throw new MetadataParseError(malformedKeys);
  }
} // Adapted from https://stackoverflow.com/a/38616988

// Markdown AST -> word count compiler
function retextCount() {
  this.Compiler = countWords;

  function countWords(tree) {
    if (tree.type == "text") {
      return tree.value.trim().split(/\s+/).length;
    }
    return (tree.children || [])
      .map(countWords)
      .reduce((sum, count) => sum + count, 0);
  }
}

export function parse(contents) {
  const file = new VFile(contents);
  matter(file, { strip: true });

  // Extract metadata
  const metadata = file.data.matter;

  validate(metadata);

  const { title, summary, tags, created } = metadata;

  const slug = slugify(title);

  // Extract rendered post content
  const body = unified()
    .use(remarkParse)
    .use(remarkFootnotes)
    .use(remarkGFM)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .processSync(file).contents;

  // Calculate word count
  const wordCount = unified()
    .use(remarkParse)
    .use(remarkFootnotes)
    .use(remarkGFM)
    .use(remarkMath)
    .use(retextCount)
    .processSync(file).result;

  return {
    title,
    slug,
    summary,
    tags,
    wordCount,
    body,
    created,
  };
}
