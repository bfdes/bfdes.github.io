---
title: Monte Carlo to Las Vegas
tags: [Algorithms, APIs]
created: 2019-06-15
summary: Trading performance for code reuse and readability in algorithm API design
---

Recently I wrote an algorithms library while following Computer Science courses to understand better the fundamental data structures that underpin modern computing. In the process, I gained an appreciation of the benefits of good API design.

Sometimes, but not always, the goal of exposing a lean library API conflicts with that of writing performant code. Let's look at one such situation I encountered when adding a substring search algorithm to [Collections](https://github.com/bfdes/Collections).

## Monte Carlo algorithms

Monte Carlo algorithms are those which we can guarantee to terminate in finite time but which may yield an incorrect result now and then.[^1] On the other hand, a Las Vegas algorithm is guaranteed to produce a correct result, but we might only be able to obtain a probabilistic measure of its runtime.

It is possible to formulate a Las Vegas variant of an algorithm from the Monte Carlo variant in some cases. The Rabin Karp substring search algorithm has this property.

## Substring search

Substring search algorithms let us find the position of a substring `p` within a larger piece of text `t`.

The naïve or brute force algorithm loops through every character of search text and attempts to match the search string against the next `len(p)` characters encountered. It performs poorly for large text.[^2]

We can do much better by using something like Rabin-Karp search.

Suppose our library exposes substring search algorithms as curried functions `f`:

$$
f : p \mapsto t \mapsto i,
$$

where $i \in I$ if the substring is found, and $i = -1$ otherwise.[^3]

Example usage in Python:

```python
>>> find("needle")("It's like looking for a needle in a haystack")
24
>>> find("nettle")("It's like looking for a needle in a haystack")
-1
```

The goal is to enable the client to write the Las Vegas variant of Rabin Karp in terms of the Monte Carlo variant `f` so that the library only has to export one implementation.

## Rabin-Karp

The Rabin Karp algorithm attempts to find the search string by computing a rolling hash of successive substrings in the search text.[^4] The Monte Carlo variant returns the index that defines the first substring with a hash matching that of the pattern -- if one exists. Note that a hash collision can result in a false positive match.

Looking at code will make the idea clear. Here is a Python implementation of Rabin Karp:

```python
def monte_carlo(pattern):
  r = 256  # Search over ASCII characters
  q = 997  # Large prime number
  m = len(pattern)

  def hash(s):
    # Hash the first m characters of s
    h = 0
    for c in s[:m]:
      h = (h * r + ord(c)) % q
    return h

  pattern_hash = hash(pattern)

  def search(text):
    # Compare the rolling hash to the pattern hash
    text_hash = hash(text)
    n = len(text)
    if text_hash == pattern_hash:
      return 0

    # Precompute r^(m-1) % q for use in removing leading digit
    R = 1
    for _ in range(1, m):
      R = (r * R) % q

    for i in range(m, n):
      # Remove contribution from the leading digit
      text_hash = (text_hash + q - R * ord(text[i-m]) % q) % q
      # And add contribution from trailing digit
      text_hash = (text_hash * r + ord(text[i])) % q
      if text_hash == pattern_hash:
        return i - m + 1
    return -1  # Not found

  return search
```

The Las Vegas variant additionally performs an equality check to verify that the substrings `pattern` and `text[i-m:i]` are the same before returning from the search loop. But this is equivalent to modifying the Monte Carlo variant to call itself on the remaining portion of text if an equality check fails, viz:

```python
# Client code
def las_vegas(pattern):
  m = len(pattern)

  def search(text, start=0):
    i = monte_carlo(pattern)(text[start:])  # From library
    if i == -1:
      return -1
    if pattern == text[start+i:start+i+m]:
      return start+i
    return search(text, start+i+1)

  return search
```

So it looks like library consumers can quickly adapt the Monte Carlo variant of the algorithm to create the Las Vegas form if they need to.

## Engineering tradeoffs

It is generally very hard to get a free lunch.[^5] In this case, reusing code can lead to performance and memory usage issues.

Consider what happens when search text contains lots of false positive matches:

1. Every false positive match creates an extra stack frame, potentially leading to high stack usage.
2. Every false positive match results in the hash within `monte_carlo` being recomputed needlessly.

The first problem can be dealt with by simply rewriting `las_vegas` in an iterative fashion:[^6]

```python
def las_vegas(pattern):
  m = len(pattern)

  def search(text):
    start = 0
    while True:
      i = monte_carlo(pattern)(text[start:])  # From library
      if i == -1:
        return -1
      if pattern == text[start+i:start+i+m]:
        return start+i
      start = start+i+1

  return search
```

We can only solve the second problem by writing the implementation from scratch.

The library can support just the Monte Carlo implementation if it is not likely to be used in situations where false positive matches are unacceptable. Unfortunately, generally speaking, library authors cannot be sure that developers won't use their code in pathological cases.

## Acknowledgements

I want to thank those who reviewed the first draft of this blog post. [Adil Parvez](https://adilparvez.com) helped me define the tone of the article, and [Scott Williams](https://scottw.co.uk) pointed out that it is, in fact, possible to go from a Las Vegas variant of an algorithm to a Monte Carlo variant.[^7]

[^1]: More concretely, the result of a Monte Carlo algorithm may be incorrect with a _known_ probability.
[^2]: In the worst-case scenario, the runtime is bounded by $$O(mn)$$, where $$m$$, $$n$$ are the lengths of the pattern and search text, respectively.
[^3]: This API is the best for Rabin Karp because it enables a small optimisation: the user can "share" the work of the initial pattern hash across multiple searches for the same pattern.
[^4]: The course [Algorithms, Part I](https://www.coursera.org/learn/algorithms-part1) does an excellent job in explaining how Rabin-Karp works.
[^5]: Unless you work at Google :P
[^6]: We can get away using recursion when working in a language that supports tail-call optimisation. Unfortunately, [Python does not](https://stackoverflow.com/a/13592002).
[^7]: For example, an absurd way of implementing `monte_carlo` given `las_vegas` is to return the correct index on every other invocation and a random one otherwise.
