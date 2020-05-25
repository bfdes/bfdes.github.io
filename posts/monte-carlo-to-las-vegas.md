---
title: Monte Carlo to Las Vegas
tags: [Algorithms, API]
created: 2019-06-15
summary: Trading performance for code reuse and readability in algorithm API design
---

Recently I have been writing an algorithms library while following Computer Science courses to understand better the fundamental data structures that underpin modern computing. In the process, I have gained an appreciation of the benefits of good API design.

Sometimes, but not always, the goal of exposing a lean library API conflicts with that of writing performant code. Let us look at one such situation that I encountered while writing [Treadstone](https://github.com/bfdes/Treadstone).

The Monte Carlo class of algorithms are those which we can guarantee to terminate in finite time, but which may yield an incorrect result now and then. A Las Vegas algorithm, on the other hand, is guaranteed to produce a correct result, but we might only be able to obtain a probabilistic measure of its runtime.

In some cases, it is possible to formulate a Las Vegas variant from the Monte Carlo variant of an algorithm.

The Rabin Karp substring search algorithm has this property. Suppose we expose substring search algorithms as functions $f$ that accept substrings $p$ and return search functions for the text $t$:

$$
f : p \mapsto t \mapsto i,
\ \text{where} \ i =
\begin{cases}
  -1 &\text{if not found} \\
   i \in I &\text{if found}
\end{cases}
$$

The goal is to enable the client to write Las Vegas variant in terms of the Monte Carlo variant `f`, so that the library only has to export one implementation of Rabin Karp.

## Rabin-Karp

The Rabin Karp algorithm attempts to find the target pattern by computing a rolling hash of successive substrings. In the Monte Carlo variant, we return the index that defines the first substring with a hash matching that of the pattern -- if one exists. Note that a hash collision can result in a false positive match.

Here is a Python implementation of the Monte Carlo form of Rabin Karp as it appears in [Algorithms II](https://www.pearson.com/us/higher-education/program/Sedgewick-Algorithms-4th-Edition/PGM100869.html):

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

Library consumers can quickly adapt the Monte Carlo variant if they need to, and library authors can reuse implementation code when writing the Las Vegas form of Rabin Karp.

## Eating your Cake

So what is the problem with reusing code? Well, there are a couple of penalties to be mindful of that only manifest themselves when search text contains lots of false-positive matches.

- When working in a language that does not come with a tail-call optimising compiler, we must use an iterative version of `las_vegas` to prevent high stack usage.
- Performing the equality check outside `monte_carlo` means we lose access to the rolling hash within the closure. We can only avoid recomputing it by writing the implementation from scratch.

The library can support just the Monte Carlo implementation if it is not likely to be used in situations where false positive matches are unacceptable. Unfortunately, generally speaking, library authors cannot be sure that their code will not be used in pathological cases.

## Acknowledgements

I want to thank those who reviewed the first draft of this blog post. [Adil Parvez](https://adilparvez.com) helped me define the motivation and tone of the article, and [Scott Williams](https://scottw.co.uk) pointed out that it is, in fact, possible to go from a Las Vegas variant to a Monte Carlo variant of an algorithm.
