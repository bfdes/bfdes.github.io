import React from "react";

type Props = {
  value: number;
};

const WordCount: React.FC<Props> = ({ value }: Props) => (
  <>
    {value} {value > 1 ? "words" : "word"}
  </>
);

export default WordCount;
