import * as React from "react";
import { Context } from "../containers";
import { RequestError } from "../http";
import Date from "./Date";
import Error from "./Error";
import NoMatch from "./NoMatch";
import PaginationLink from "./PaginationLink";
import Spinner from "./Spinner";
import Tags from "./Tags";

function Post(props: Post): React.ReactElement {
  const { title, body, created, tags, wordCount, previous, next } = props;
  return (
    <>
      <div className="post">
        <h1>{title}</h1>
        <p className="meta">
          <Date timestamp={created} />
          {" · "}
          <Tags tags={tags} />
          {" · "}
          {wordCount} {wordCount !== 1 ? " words" : " word"}
        </p>
        <div dangerouslySetInnerHTML={{ __html: body }} />
      </div>
      <div className="pagination">
        <PaginationLink next={previous}>Previous</PaginationLink>
        <PaginationLink next={next}>Next</PaginationLink>
      </div>
    </>
  );
}

type Props = {
  slug: string;
  context?: {
    data: Post;
  };
  get(url: string): Promise<Post>;
};

type State = {
  post: Post;
  loading: boolean;
  error: RequestError;
};

class PostOr404 extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    let post;
    if (__isBrowser__) {
      post = window.__INITIAL_DATA__ as Post;
      delete window.__INITIAL_DATA__;
    } else {
      post = this.props.context.data;
    }

    this.state = {
      post,
      error: null,
      loading: false
    };

    this.fetchPost = this.fetchPost.bind(this);
  }

  public componentDidMount(): void {
    if (!this.state.post) {
      const { slug } = this.props;
      this.fetchPost(slug);
    }
  }

  public componentDidUpdate(prevProps: Props): void {
    const { slug } = this.props;
    if (prevProps.slug !== slug) {
      this.fetchPost(slug);
    }
  }

  public render(): React.ReactElement {
    const { post, error, loading } = this.state;
    if (error && error.status === 404) {
      return <NoMatch />;
    }
    if (error) {
      return (
        <Error>
          There was an error fetching the post. Please try again later.
        </Error>
      );
    }
    if (loading || post == null) {
      return <Spinner />;
    }
    return <Post {...post} />;
  }

  private fetchPost(slug: string): void {
    const url = `/api/posts/${slug}`;
    this.setState({ loading: true }, () =>
      this.props
        .get(url)
        .then(post => this.setState({ post, loading: false }))
        .catch(error => this.setState({ error, loading: false }))
    );
  }
}

function Wrapped(props: Props): React.ReactElement {
  function post(data: Post): React.ReactElement {
    return <PostOr404 {...props} context={{ data }} />;
  }
  return <Context.Post.Consumer>{post}</Context.Post.Consumer>;
}

export default Wrapped;
