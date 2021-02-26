import * as React from "react";

type TagProps = {
  value: string;
};

const Tag: React.FC<TagProps> = ({ value }: TagProps) => (
  <a href={`/tags/${value.toLowerCase()}.html`}>{value}</a>
);

type TagListProps = {
  tags: string[];
};

const TagList: React.FC<TagListProps> = ({ tags }: TagListProps) => (
  <span>
    {tags
      .map((tag) => <Tag key={tag} value={tag} />)
      .reduce((acc, tag) => [...acc, " # ", tag], [])}
  </span>
);

export default TagList;
