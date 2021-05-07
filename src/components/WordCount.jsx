import PropTypes from "prop-types";
import Template from "../template";

const WordCount = ({ value }) => (
  <>
    {value} {value > 1 ? "words" : "word"}
  </>
);

WordCount.propTypes = {
  value: PropTypes.number.isRequired,
};

export default WordCount;
