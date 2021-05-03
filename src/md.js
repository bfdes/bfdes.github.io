import unified from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import vfile from "vfile";
import matter from "vfile-matter";
import slugify from "./slugify";
import {
  TitleValidator,
  SummaryValidator,
  TagValidator,
  TimestampValidator,
} from "./validators";

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

export class MissingMetadataError extends Error {
  constructor(...args) {
    const msg = "Markup is missing metadata";
    super(msg, ...args);
  }
}

export class MetadataParseError extends Error {
  constructor(fieldName, ...args) {
    const msg = `Metadata field ${fieldName} could not be parsed from markup`;
    super(msg, ...args);
  }
}

const validators = [
  new TitleValidator(),
  new SummaryValidator(),
  new TagValidator(),
  new TimestampValidator(),
];

export function parse(contents) {
  let file = vfile({ contents });
  matter(file, { strip: true });

  // Extract metadata
  const metadata = file.data.matter;

  if (metadata === "undefined") {
    throw new MissingMetadataError();
  }

  for (const validator of validators) {
    if (!validator.isValid(metadata)) {
      throw new MetadataParseError(validator.fieldName);
    }
  }

  const { title, summary, tags, created } = metadata;

  const slug = slugify(title);

  // Extract rendered post content
  const body = unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .processSync(file)
    .toString();

  // Calculate word count
  file = vfile({ contents });
  matter(file, { strip: true });
  const wordCount = unified()
    .use(remarkParse)
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
