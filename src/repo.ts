type Slug = string;

type Post = {
  title: string;
  slug: Slug;
  summary: string;
  body: string;
  wordCount: number;
  tags: string[];
  created: Date;
  previous?: Slug;
  next?: Slug;
};

export default class Repo {
  readonly posts: Post[];
  readonly tags: Set<string>;

  constructor(posts: Post[]) {
    this.posts = posts.sort(
      (p, q) => q.created.getTime() - p.created.getTime()
    );
    this.tags = new Set(posts.flatMap((p) => p.tags));
  }

  filter(tag: string): Post[] {
    return this.posts.filter((p) => p.tags.includes(tag));
  }

  get(slug: string): Post {
    const i = this.posts.findIndex((p) => p.slug == slug);
    if (i === -1) {
      return null; // Not found
    }
    let previous;
    let next;
    if (i > 0) {
      next = this.posts[i - 1].slug;
    }
    if (i < this.posts.length - 1) {
      previous = this.posts[i + 1].slug;
    }
    return {
      previous,
      next,
      ...this.posts[i],
    };
  }
}
