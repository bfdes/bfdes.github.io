import * as React from "react";
import Date from "./Date";
import PaginationLink from "./PaginationLink";
import TagList from "./TagList";
import WordCount from "./WordCount";

type Post = {
  title: string;
  body: string;
  wordCount: number;
  tags: string[];
  created: Date;
  previous?: string;
  next?: string;
};

type Props = {
  value: Post;
};

const Post: React.FC<Props> = ({ value }: Props) => {
  const { title, body, created, tags, wordCount, previous, next } = value;
  return (
    <>
      <div className="post">
        <h1>{title}</h1>
        <p className="meta">
          <Date value={created} />
          {" · "}
          <TagList tags={tags} />
          {" · "}
          <WordCount value={wordCount} />
        </p>
        <div className="body" dangerouslySetInnerHTML={{ __html: body }} />
      </div>
      <div className="pagination">
        <PaginationLink next={previous}>Previous</PaginationLink>
        <PaginationLink next={next}>Next</PaginationLink>
      </div>
    </>
  );
};

export default Post;
