---
title: Property-based testing
tags: [Testing]
created: 2018-10-15
summary: An introduction to property-based testing and its applications in standard library algorithm validation
---

Today we discuss why property-based testing is a useful tool for verifying the correctness of complex programs. In addition, we apply the technique to test a sample algorithm comprehensively -- without and then with the aid of a testing library.

We will write the test code in Scala. Scala is fundamentally a functional programming language that retains some imperative language constructs. Knowledge of Scala is not required to follow this post, but it could help you focus on the idea being presented, as opposed to language semantics.

The completed test suite is hosted on GitHub as a [gist](https://gist.github.com/bfdes/88f3292aa2d23e619714bee4221799d8) for reference.

## What is Property-based testing?

Property-based testing involves providing a set of properties for the function or method under test. Effectively, we define a specification that our implementation should meet.

The usual approach, writing a limited set of assertions, may be satisfactory when testing simple logic:

> "**it** redirects an unauthenticated user to login".

But it is not necessarily sufficient when our outcomes are not binary:

> "**it** always returns a uniformly distributed random integer".

Property-based testing has its origins in functional programming, where data is modelled immutably, and functions are pure. Specifying properties has a direct correspondence to the way proofs of correctness are constructed in maths.

Consider the addition operation on integers. What conditions does it meet?

- Associativity:

  $$
  \left( i + j \right) + k = i + \left( j + k \right) \space \forall \space i, j, k \in \mathbb{Z}
  $$

- Identity:

  $$
  i + 0 = 0 + i = i \space \forall \space i \in \mathbb{Z}
  $$

- Commutativity:

  $$
  i + j  = j + i \space \forall \space i, j \in \mathbb{Z}
  $$

We can assert that these properties hold by verifying that they apply for arbitrary integer triples. In a similar manner, property-based testing can also be employed to check algorithms that effect mutable data. We use it to test an implementation of mergesort.

## Mergesort

This implementation of mergesort is transcribed to Scala from [Algorithms](https://algs4.cs.princeton.edu/home) by Sedgewick and Wayne.

It consists of two subroutines:

1. Split the array in two, recursively sorting each partition
2. Merge the sorted partitions

```scala
object Sorting {
  /**
    * Sorts an array with respect to an `Ordering`, using the mergesort algorithm.
    */
  def mergeSort[T: ClassTag](a: Array[T])(implicit o: Ordering[T]): Unit = {
    val aux = new Array[T](a.length)  // Use a common auxiliary array

    // Sort the subsequence [l, h]
    def sort(l: Int, h: Int): Unit = {
      if(l < h) {
        val m = l + (h-l) / 2  // Account for integer overflow
        sort(l, m)
        sort(m+1, h)
        if(o.gt(a(m), a(m+1))) {
          merge(l, m, h)  // Only merge if [l, h] is not in order
        }
      }
    }

    // Merge the sorted subsequences [l, m] and (m, h]
    def merge(l: Int, m: Int, h: Int): Unit = {
      for(i <- l until h+1){
        aux(i) = a(i)
      }

      var i = l
      var j = m + 1
      for(k <- l until h+1) {
        if(i > m) {
          a(k) = aux(j)
          j += 1
        } else if(j > h) {
          a(k) = aux(i)
          i += 1
        } else if(o.lt(aux(j), aux(i))) {
          a(k) = aux(j)
          j += 1
        } else {
          a(k) = aux(i)
          i += 1
        }  // n.b. Stable implementation of the algorithm
      }
    }
    sort(0, a.length-1)  // Run the routine on the whole array
  }
}
```

Marking the `Ordering` parameter as `implicit` tells the compiler to "look" for an instance in scope if it has not been passed-in by the caller. Many built-in types, such as `Int`, come with an `Ordering` defined.

Note that we have to use [`ClassTags`](https://docs.scala-lang.org/overviews/reflection/typetags-manifests.html) to account for JVM type-erasure.

The `Sorting` namespace is also an appropriate place to keep a utility to check array elements are ordered:

```scala
def isSorted[T](a: Array[T])(implicit o: Ordering[T]): Boolean = {
  val indices = 0 until a.length-1
  val shifted = 1 until a.length
  indices
    .zip(shifted)
    .forall { case (i, j) => o.lteq(a(i), a(j)) }
}
```

## Testing "by hand"

A sorting function is defined by two properties:

1. It must permute its **input** to form its **output**

   $$
   \left(a_i \mid i \in I \right) = \left(a'_i \mid i \in I \right)
   $$

2. It must totally-order its input to form its output (the comparer defines the total-ordering)

   $$
   a'_i \leq a'_j \space \forall \space i, j \in I \space \text{such that} \space i < j
   $$

We have described arrays as a [family](https://math.stackexchange.com/a/361530), and the primed elements belong to the permuted array.

Since a sorting function has an infinite domain, it is not possible to verify these properties without resorting to **sampling**. Here is one strategy to programmatically generate array samples:

- Progressively create arrays of increasing size (up to a maximum)
- Large arrays encode exponentially more states, so generate more of these

Our sort function can act on generic arrays, but to generate samples, we need to specialise on a type. We choose `Int`; however, there is no reason another type that has a total-ordering defined cannot be used instead -- such as `Char` or `Double`.

```scala
def arrays: Stream[Array[Int]] = {
  def sample(size: Int): Array[Int] =
    Array.fill(size)(rnd.nextInt())

  def samples(size: Int): Stream[Array[Int]] =
    Stream.fill(math.pow(2, size).toInt)(sample(size))  // Sample 2^size times

  Stream.range(0, maxSize).flatMap(samples)
}  // `maxSize` and `rnd` come from the test class
```

Language and machine constraints limit integer arrays of size `n` to `math.pow(2*Int.MaxValue, n)` permutations. We only take `math.pow(2, n)` samples to keep the time it takes to run tests manageable.

Note that, although it is not evident from the caller's perspective, the second argument of `Stream.fill` is evaluated [lazily](https://docs.scala-lang.org/tour/by-name-parameters.html), so every sample will be distinct.

Using [ScalaTest](http://www.scalatest.org) as the test runner, the test-code ends up being quite lean:

```scala
class SortingTest extends FlatSpec {
  val rnd = new Random()
  val maxSize = 20

  // Context manager to give tests access to sample arrays
  def withFixture(testCode: Array[Int] => Boolean): Unit = {
    val maybeFailed = arrays.find(a => !testCode(a))
    maybeFailed.foreach(a =>
      fail(a.mkString("[", ", ", "]"))
    )
  }

  "mergeSort" should "produce a sorted array" in withFixture { array =>
    mergeSort(array)
    isSorted(array)
  }

  it should "rearrange keys" in withFixture { array =>
    val before = new Histogram(array)
    mergeSort(array)
    val after = new Histogram(array)
    before == after
  }
}
```

When verifying property two, we relied on a histogram abstraction to count array elements:

```scala
class Histogram[K](keys: Seq[K]) {
  private val underlying =
    keys.foldLeft(Map.empty[K, Int]) { (m, k) =>
      val count = m.getOrElse(k, 0) + 1
      m + (k -> count)
    }

  override def equals(histogram: Any): Boolean =
    histogram match {
      case h: Histogram[K] =>
        h.underlying.equals(underlying)
      case _ => false
    }

  override def hashCode: Int = underlying.hashCode
}
```

The strategy in use to generate samples does not adequately cover the situation where arrays to sort are saturated with duplicate keys. Additionally, the tests fail to verify that our implementation of mergesort is stable. We can address both shortcomings with extra code, but it is easier to use ScalaCheck.

## Testing with ScalaCheck

[ScalaCheck](https://www.scalacheck.org) is a library designed to aid property-based testing. It is inspired by Haskell's QuickCheck.

To use ScalaCheck, we need to be aware of two abstract data types it exports:

- `Gen[T]` is a [monad](https://en.wikipedia.org/wiki/Monad) that encodes all the information necessary to produce samples of type `T`
- `Prop` verifies a property by sampling a generator that is passed to it

Here is the (naïve) strategy for sample generation, re-written using ScalaCheck:

```scala
def unsaturated: Gen[Array[Int]] =
  Gen.containerOf[Array, Int](Gen.posNum)
```

ScalaCheck will choose the maximum sample size to generate when running the test.

To test cases where duplicate keys are common, we modify the generator that creates keys to limit itself to choose from the range `[0, sqrt(size))`, where `size` is the length of the array being filled.

```scala
def saturated: Gen[Array[Int]] = {
  // One possible way of saturating the array with duplicate keys
  val sized = Gen.sized(s => Gen.choose(0, Math.sqrt(s).toInt))
  Gen.containerOf[Array, Int](sized)
}
```

A stable sorting algorithm is one that ensures that any two keys which compare equally maintain their relative positions in the array. To test `mergeSort` is stable we create arrays loaded with tuples, sorting them by the second element in the tuple _and then_ the first. We should find that the mutated array is sorted with respect to a compound order which orders the tuples by comparing first elements and, if necessary, breaks ties on the second element. (Actually, this is the default ordering for tuples in Scala.)

Here is the resulting test code, without the generators listed above:

```scala
object SortingSpecification extends Properties("mergeSort") {
  type Pair = (Int, Int)  // a type alias

  def pairs: Gen[Array[Pair]] = {
    val n = Gen.choose(0, 5)
    val pair = for {
      i <- n
      j <- n
    } yield (i, j)  // Syntax sugar for n.flatMap(i => n.map(j => (i, j)))
    Gen.containerOf[Array, Pair](pair)
  }

  property("isSorted") = Prop.forAll(unsaturated) { a =>
    mergeSort(a)
    isSorted(a)
  }

  property("keys") = Prop.forAll(unsaturated) { a =>
    val before = new Histogram(a)
    mergeSort(a)
    val after = new Histogram(a)
    before == after
  }

  property("isStable") = Prop.forAll(pairs) { a =>
    val byI = Ordering.by[Pair, Int](_._1)
    val byJ = Ordering.by[Pair, Int](_._2)

    mergeSort(a)(classTag[Pair], byJ)
    mergeSort(a)(classTag[Pair], byI)
    isSorted(a)
  }
}
```

By using ScalaCheck, we have traded some transparency for the ability to abstract away the details of test case generation. Also, ScalaCheck can perform [test case minimisation](https://github.com/rickynils/scalacheck/blob/master/doc/UserGuide.md#test-case-minimisation), which is useful when debugging.

## Further reading

Mergesort was chosen to demonstrate property-based testing because it is the only performant sorting algorithm that is also stable. System sorts typically use a variant of mergesort for sorting reference types, and quicksort for primitives. Sedgewick and Wayne discuss this in more detail.

If you want more insight into how ScalaCheck works, it would be worth reading the book [Functional Programming in Scala](https://www.manning.com/books/functional-programming-in-scala). The eight-chapter walks the reader through designing such a library.
