import unified from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
const rehypeHighlight = require("rehype-highlight");
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import vfile, { VFile } from "vfile";
const matter = require("vfile-matter");
import { Content } from "mdast";

// Markdown AST -> word count compiler
function retextCount() {
  this.Compiler = countWords;

  function countWords(tree: Content): number {
    if (tree.type == "text") {
      return tree.value.trim().split(/\s+/).length;
    }
    if (Array.isArray(tree.children)) {
      return tree.children
        .map(countWords)
        .reduce((sum, count) => sum + count, 0);
    }
    return 0;
  }
}

interface Meta {
  title: string;
  summary: string;
  tags: string[];
  created: Date;
}

interface Post extends Meta {
  wordCount: number;
  body: string;
}

interface VFileWithMeta extends VFile {
  data: {
    matter?: Meta;
  };
}

export default function parse(contents: Buffer): Post {
  let file = vfile({ contents }) as VFileWithMeta;
  matter(file, { strip: true });
  // Extract metadata
  const { title, summary, tags, created } = file.data.matter;

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
  file = vfile({ contents }); // n.b. render process mutates the file
  matter(file, { strip: true });
  const wordCount = unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(retextCount)
    .processSync(file).result as number;

  return {
    title,
    summary,
    tags,
    wordCount,
    body,
    created,
  };
}
