import Template from "../template";

const XMLNode = ({ name, children, ...attributes }) => {
  return Template.createElement(name, attributes, children);
};

const Feed = ({ metaData }) => (
  <XMLNode name="rss" version="1.0">
    <XMLNode name="channel">
      <XMLNode name="title">{"bfdes.in"}</XMLNode>
      <XMLNode name="link">{"https://bfdes.in"}</XMLNode>
      <XMLNode name="description">{"Programming and Technology blog"}</XMLNode>
      {metaData.map(({ created, slug, title, summary }) => {
        const url = `https://www.bfdes.in/posts/${slug}.html`;
        return (
          <XMLNode name="item" key={slug}>
            <XMLNode name="title">{title}</XMLNode>
            <XMLNode name="author">{"Bruno Fernandes"}</XMLNode>
            <XMLNode name="description">{summary}</XMLNode>
            <XMLNode name="link">{url}</XMLNode>
            <XMLNode name="guid">{url}</XMLNode>
            <XMLNode name="pubDate">{created.toUTCString()}</XMLNode>
          </XMLNode>
        );
      })}
    </XMLNode>
  </XMLNode>
);

export default Feed;
