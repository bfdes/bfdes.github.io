export default class Repo {
  constructor(posts) {
    this.posts = [];

    posts.sort((p, q) => q.created - p.created);

    for (let i = 0; i < posts.length; i++) {
      let previous;
      let next;
      if (i > 0) {
        next = posts[i - 1].slug;
      }
      if (i < posts.length - 1) {
        previous = posts[i + 1].slug;
      }
      this.posts.push({
        previous,
        next,
        ...posts[i],
      });
    }

    this.tags = new Set();

    for (const post of posts) {
      for (const tag of post.tags) {
        this.tags.add(tag);
      }
    }
  }
}
