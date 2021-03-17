import Template from "../template";
import slugify from "../slugify";

const Tag = ({ value }) => <a href={`/tags/${slugify(value)}.html`}>{value}</a>;

const TagList = ({ tags }) => (
  <span>
    {tags
      .map((tag) => <Tag key={tag} value={tag} />)
      .reduce((acc, tag) => [...acc, " # ", tag], [])}
  </span>
);

export default TagList;
