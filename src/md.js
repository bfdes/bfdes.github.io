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
  let file = vfile({ contents });
  matter(file, { strip: true });
  // Extract metadata
  const { title, summary, tags, created } = file.data.matter;
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
