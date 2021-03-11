import Template from "../template";

const WordCount = ({ value }) => (
  <>
    {value} {value > 1 ? "words" : "word"}
  </>
);

export default WordCount;
