import * as React from "react";

type Message = string;

type Props = {
  next?: string;
  children: Message;
};

const PaginationLink: React.FC<Props> = ({ next, children }: Props) => (
  <span className="pagination-item">
    {next ? (
      <a href={`/posts/${next}.html`}>{children}</a>
    ) : (
      <span>{children}</span>
    )}
  </span>
);

export default PaginationLink;
