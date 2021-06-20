---
title: Property testing
tags: [Testing]
created: 2018-10-15
summary: An introduction to property-based testing and its applications in standard library algorithm validation
---

Property testing is a valuable tool for verifying the correctness of complex programs and libraries. It involves providing a set of properties that state or functions should obey. Effectively, the developer writes a specification for their work.

Properties are usually defined with the aid of a property testing library, like Haskell's QuickCheck.[^1] These libraries also enable users to generate sample data to drive properties during test execution.

For example, a roundtrip property can verify that a JSON parser is consistent. In Scala, with [ScalaCheck](https://www.scalacheck.org/), this looks like

```scala
object JsonSpecification extends Properties("encode & decode") {
  property("roundtrip") = Prop.forAll(json) { js =>
    Json.decode(Json.encode(js)) == js
  }
}
```

Mathematically speaking, it says that the `decode` function is an inverse of the `encode` function.[^2] In fact, specifying properties corresponds to how proofs of correctness are constructed in maths.[^3]

We will write a property test suite for our implementation of the mergesort algorithm to illustrate the value of property testing. The test suite will need to be comprehensive, as millions of people will be using our library.[^4]

Knowledge of Scala is not required to follow this post, but it could help you focus on the ideas being presented instead of language syntax.

You can find the completed test suite as a GitHub [gist](https://gist.github.com/bfdes/88f3292aa2d23e619714bee4221799d8). It prints

```plaintext
+ mergeSort.isSorted: OK, passed 100 tests.
+ mergeSort.keys: OK, passed 100 tests.
```

after running.

# Properties VS Assertions

Assertions can be regarded as tests for example scenarios represented by a single property. Write property tests when it becomes tiresome or impossible to provide every example scenario.

Compare the table-driven test excerpt

```scala
List(
  Json.num(13),
  Json.str("foo"),
  Json.arr("foo", "bar"),
  Json.obj("foo" -> "bar")
).foreach { js =>
  assert(Json.decode(Json.encode(js)) == js)
}
```

to the simple property definition we saw before, which checks many more cases.[^5]

ScalaCheck can generate exhaustive test cases for functions with a finite domain. For functions with an infinitely sized domain, such as the sorting function we are going to look at, we should write generators that obtain a representative sample.[^6]

Even when the domain is finite, sometimes we limit generators to sample from a subset so that tests do not take too long to run.

Assertion-based tests are better at documenting edge case behaviour, or ensuring that tests always run for edge case input. For JSON parsing, edge case input could include empty strings, arrays or objects:

```scala
assert(Json.encode(Json.decode("")) == Json.str(""))
assert(Json.encode(Json.decode(Json.arr())) == Json.arr())
assert(Json.encode(Json.decode(Json.obj())) == Json.obj())
```

# A Specification for sorting

Formally, a sorting function is defined by two properties:

1. It must permute its **input** to form its **output**

$$
\left(a_i \mid i \in I \right) = \left(a'_i \mid i \in I \right)
$$

2. It must order its input to form its output according to a [total order](https://en.wikipedia.org/wiki/Total_order)

$$
a'_i \leq a'_j \space \forall \space i, j \in \{i, j \in I \mid i < j\}
$$

We have described arrays as a [family](https://math.stackexchange.com/questions/361449/notation-for-an-array/361530#361530), and the primed elements belong to the permuted array.

To help write the tests, we need a utility to check the keys of an array are in sorted order:

```scala
def isSorted[T](a: Array[T])(implicit o: Ordering[T]): Boolean =
  Range(0, a.length - 1).forall(i => o.lteq(a(i), a(i + 1)))
```

, and a `Histogram` abstraction to count keys:

```scala
class Histogram[K](keys: Seq[K]) {
  private val underlying =
    keys.foldLeft(Map.empty[K, Int]) { (m, k) =>
      val count = m.getOrElse(k, 0) + 1
      m + (k -> count)
    } // e.g. `"banana"` becomes `Map('a' -> 3, 'b' -> 1, 'n' -> 2)`

  override def equals(that: Any): Boolean =
    that match {
      case h: Histogram[K] =>
        h.underlying.equals(underlying)
      case _ => false
    }

  override def hashCode: Int = underlying.hashCode
}
```

# Mergesort

The [gist](https://gist.github.com/bfdes/88f3292aa2d23e619714bee4221799d8) contains an implementation of mergesort transcribed to Scala from [Algorithms I](https://www.coursera.org/learn/algorithms-part1).

Mergesort is a divide-and-conquer algorithm; it consists of two subroutines:

1. One splits an array in two and recursively sorts the partitions, and
2. the other merges sorted partitions.

Note that our implementation `mergeSort` carries out a stable sort -- it ensures that any two keys which compare equally maintain their relative positions in the array. Writing a property to verify `mergeSort` is indeed stable is left as an exercise for the reader.[^7]

# Testing with ScalaCheck

To use ScalaCheck, we need to be aware of two abstract data types it exports:

- `Gen[T]` instances encode all the information necessary to produce samples of type `T`
- `Prop` enables us to verify properties by sampling a generator

## Writing generators

It is impossible to create generators for the infinite number of input types that generic functions like `mergeSort[T]` accept, so we have to limit ourselves to a handful. For the sake of simplicity, let's constrain the test suite even further and only test positive integer array input.

We can use the combinators ScalaCheck provides to quickly write a generator for integer arrays:

```scala
val intArray: Gen[Array[Int]] =
  Gen.containerOf[Array, Int](Gen.posNum[Int])
```

ScalaCheck will choose the number of samples to generate when running the test, as well as the size of the largest array. It may not behave as we want it to by default.[^6]

## Writing properties

It is really straightforward to write property number one, given the array generator we already have:

```scala
val propOne =
  Prop.forAll(intArray) { a =>
    mergeSort(a)
    isSorted(a)
  }
```

Writing property number two is only slightly more involved:

```scala
val propTwo =
  Prop.forAll(intArray) { a =>
    val before = new Histogram(a)
    mergeSort(a)
    val after = new Histogram(a)
    before == after
  }
```

## Putting it all together

We have everything we need to test `mergeSort` works (for integer arrays):

```scala
object SortingSpecification extends Properties("mergeSort") {
  val array: Gen[Array[Int]] =
    Gen.containerOf[Array, Int](Gen.posNum[Int])

  property("isSorted") = Prop.forAll(array) { a =>
    mergeSort(a)
    isSorted(a)
  }

  property("keys") = Prop.forAll(array) { a =>
    val before = new Histogram(a)
    mergeSort(a)
    val after = new Histogram(a)
    before == after
  }
}
```

That's it! Not a lot of code, considering the problem we were trying to solve.

If `mergeSort` is faulty for whatever reason, then ScalaCheck would

1. "shrink" the input to find the smallest possible array that fails to be sorted, and
2. print out the seed for the failing test to aid debugging.

```plaintext
failing seed for mergeSort.isSorted is 1GSNrW_g7K6qDK0yf7ZVqjncxQGRBA2_afg_I2PsRKC=
! mergeSort.isSorted: Falsified after 10 passed tests.
> ARG_0: Array("1", "1", "0")
> ARG_0_ORIGINAL: Array("10", "95", "78", "13", "64")
```

If you want more insight into how ScalaCheck works, take a look at the book [Functional Programming in Scala](https://www.manning.com/books/functional-programming-in-scala). Chapter eight walks the reader through designing a similar library from scratch.

[^1]: QuickCheck [pioneered](https://doi.org/10.1145/351240.351266) property testing.
[^2]: You might want to write assertion-based regression tests to verify `encode(decode(js)) == js`.
[^3]: For example, the associative, identity, and commutative laws of vector addition are properties.
[^4]: Only joking. Even I won't be relying on the implementation.
[^5]: One caveat: The variety of JSON objects generated is dependent on how well `json` is written.
[^6]: Representative samples are not necessarily uniform. For example, larger arrays can encode exponentially more states than smaller ones, so shouldn't a sorting algorithm be tested more frequently with larger arrays?
[^7]: Hint: Consider sorting an array of `User` objects:

    ```scala
    case class User(name: String, height: Double, age: Int)
    ```

    Ordering users by age and then reordering them by height should _always_ have the same result as ordering users by height and breaking ties on age.
