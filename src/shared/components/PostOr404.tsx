import * as React from 'react';
import Tags from './Tags';
import NoMatch from './NoMatch';
import Spinner from './Spinner';
import { RequestError } from '../http';
import { parseDate } from '../utils';
import { Context } from '../containers';

const Post: React.SFC<Post>
  = ({title, body, created, tags, wordCount}) => (
    <div className='post'>
      <h1>{title}</h1>
      <p className='meta'>
        {parseDate(created)}
        {' · '}<Tags tags={tags}/>
        {' · '}{wordCount} {wordCount != 1 ? ' words' : ' word'}
      </p>
      <div dangerouslySetInnerHTML={{__html: body}}/>
    </div>
  )

type Props = {
  get(url: string): Promise<Post>,
  slug?: string,
  context?: {
    data: Post
  }
}

type State = {
  post: Post,
  loading: boolean,
  error: RequestError,
}

class PostOr404 extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    let post
    if(__isBrowser__) {
      post = (window as any).__INITIAL_DATA__
      delete (window as any).__INITIAL_DATA__
    } else {
      post = this.props.context.data
    }

    this.state = {
      post,
      error: null,
      loading: false
    }

    this.fetchPost = this.fetchPost.bind(this)
  }

  componentDidMount() {
    if(!this.state.post) {
      const { slug } = this.props
      this.fetchPost(slug)
    }
  }

  componentDidUpdate(prevProps: Props, _: State) {
    if(prevProps.slug != this.props.slug) {
      const { slug } = this.props
      this.fetchPost(slug)
    }
  }

  private fetchPost(slug: string): void {
    const url = `/api/posts/${slug}`
    this.setState({loading: true}, () =>
      this.props.get(url).then(post => 
        this.setState({post, loading: false})
      ).catch(error => 
        this.setState({error, loading: false})
      )
    )
  }

  render() {
    const { post, error, loading } = this.state
    if(error && error.status == 404) {
      return <NoMatch />
    }
    if(error) {
      return (
        <div className='error'>
          <h1>Error</h1>
          <div>There was an error fetching the post.</div>
        </div>
      )
    }
    if(loading || post == null) {
      return <Spinner />
    }
    return <Post {...post} />
  }
}

const Wrapped: React.SFC<Props> = props => (
  <Context.Post.Consumer>
    {post => <PostOr404 {...props} context={{data: post}} />}
  </Context.Post.Consumer>
)

export default Wrapped;
