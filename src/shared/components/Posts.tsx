import * as React from "react";
import { Link } from "react-router-dom";
import { Context } from "shared/containers";
import { RequestError } from "shared/http";
import Date from "./Date";
import Error from "./Error";
import Spinner from "./Spinner";
import Tags from "./Tags";

const PostStub: React.FC<PostStub> = (props: PostStub) => {
  const { title, slug, wordCount, created, tags } = props;
  return (
    <li className="post">
      <Link to={`/posts/${slug}`} className="nav-item">
        <h3>{title}</h3>
      </Link>
      <p className="meta">
        <Date timestamp={created} />
        {" · "}
        <Tags tags={tags} />
        {" · "}
        {wordCount} {wordCount !== 1 ? "words" : "word"}
      </p>
    </li>
  );
};

/*
A tag may be supplied (by React Router) if the user has chosen to filter posts by tag.
Additionally, if the component is server rendered, then we supply posts in advance ysing React's context API.
*/
type Props = {
  tag?: string;
  context?: {
    data: PostStub[];
  };
  get(url: string, signal: AbortSignal): Promise<PostStub[]>;
};

type State = {
  posts: PostStub[];
  loading: boolean;
  error: RequestError;
};

class Posts extends React.Component<Props, State> {
  private controller: AbortController;
  constructor(props: Props) {
    super(props);

    /*
    On the server posts are supplied using React's Context API,
    but on the client a deferred render occurs and this DOM must match that rendered on the server.
    To ensure this happens we need to supply the data through the window too.

    Otherwise the render must be caused by internal navigation, in which case the window will be clean due to (1)
    */
    let posts;
    if (__isBrowser__) {
      posts = window.__INITIAL_DATA__ as PostStub[];
      delete window.__INITIAL_DATA__; // (1)
    } else {
      posts = props.context.data;
    }

    this.state = {
      posts,
      error: null,
      loading: false,
    };

    this.fetchPosts = this.fetchPosts.bind(this);
  }

  /*
  Fetch posts when component mounts (not called on server),
  but not when React's deferred first render occurs.
  */
  public componentDidMount(): void {
    this.controller = new AbortController();
    if (this.state.posts == null) {
      const { tag } = this.props;
      this.fetchPosts(tag);
    }
  }

  /*
  Fetch posts afresh if filtering by another tag.
  */
  public componentDidUpdate(prevProps: Props): void {
    const { tag } = this.props;
    if (prevProps.tag !== tag) {
      this.fetchPosts(tag);
    }
  }

  public render(): React.ReactElement {
    const { posts, loading, error } = this.state;
    const { tag } = this.props;
    if (error) {
      return (
        <Error>
          There was an error fetching the posts. Please try again later.
        </Error>
      );
    }
    if (loading || posts == null) {
      return <Spinner />;
    }
    if (posts.length === 0) {
      return (
        <Error>
          {`There aren't any posts ${
            tag ? `under ${tag}` : "yet"
          }. Please come back later.`}
        </Error>
      );
    }

    return (
      <div className="posts">
        <h1>Blog</h1>
        <ul id="posts">
          {posts.map((post) => (
            <PostStub key={post.slug} {...post} />
          ))}
        </ul>
      </div>
    );
  }

  public componentWillUnmount(): void {
    this.controller.abort();
  }

  private fetchPosts(tag?: string): void {
    const url = `/api/posts${tag === undefined ? "" : `?tag=${tag}`}`;
    this.setState({ loading: true }, () =>
      this.props
        .get(url, this.controller.signal)
        .then((posts) => this.setState({ posts, loading: false }))
        .catch((error) => {
          if (error.name !== "AbortError") {
            this.setState({ error, loading: false });
          }
          // User navigated away
        })
    );
  }
}

const Wrapped: React.FC<Props> = (props: Props) => {
  const data = React.useContext(Context.Posts);
  return <Posts {...props} context={{ data }} />;
};

export default Wrapped;
