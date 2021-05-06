import PropTypes from "prop-types";
import Template from "../template";
import slugify from "../slugify";

const Tag = ({ value }) => <a href={`/tags/${slugify(value)}.html`}>{value}</a>;

Tag.propTypes = {
  value: PropTypes.string.isRequired,
};

const TagList = ({ tags }) => (
  <span>
    {tags
      .map((tag) => <Tag key={tag} value={tag} />)
      .reduce((acc, tag) => [...acc, " # ", tag], [])}
  </span>
);

TagList.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default TagList;
