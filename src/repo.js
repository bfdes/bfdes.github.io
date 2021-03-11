export default class Repo {
  constructor(posts) {
    this.posts = posts.sort((p, q) => q.created - p.created);
    this.tags = new Set(posts.flatMap((p) => p.tags));
  }

  filter(tag) {
    return this.posts.filter((p) => p.tags.includes(tag));
  }

  get(slug) {
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
