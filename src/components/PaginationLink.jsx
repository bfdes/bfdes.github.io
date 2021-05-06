import PropTypes from "prop-types";
import Template from "../template";

const PaginationLink = ({ next, children }) => (
  <span className="pagination-item">
    {next ? (
      <a href={`/posts/${next}.html`}>{children}</a>
    ) : (
      <span>{children}</span>
    )}
  </span>
);

PaginationLink.propTypes = {
  next: PropTypes.string,
  children: PropTypes.node,
};

export default PaginationLink;
