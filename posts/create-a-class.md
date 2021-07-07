---
title: Create-A-Class
tags: [Optimization]
created: 2019-12-05
summary: Applying combinatorial optimization to competitive multiplayer video game strategy
---

Create-A-Class is a loadout customization system in the [first-person shooter](https://en.wikipedia.org/wiki/First-person_shooter) franchise Call Of Duty.

In multiplayer matches, players are pit against each other in deathmatch or objective capture game modes. Good gunplay and weapon customization is an important part of the competitive experience. Your loadout can make or break a match.

Modern Warfare, the latest entry in the Call Of Duty series, takes weapon customization a step further than its predecessors. Players can modify weapons extensively in the [Gunsmith](https://blog.activision.com/call-of-duty/2019-09/A-Deeper-Look-at-Modern-Warfare-Customization) component of Create-A-Class.

I wondered whether it would be possible to determine the "best" modifications for a weapon without trying out every permutation of attachments.

## Gunsmith

In the game world, each weapon has a set of base attributes that define how it handles. These include, but are not limited to, the weapon's range, its damage and the recoil it imparts.

For example, submachine guns like the MP5 are easier to control than assault rifles but typically do less damage at longer ranges.[^1]

In Gunsmith, players can add attachments to up to five different places on a weapon. For the sake of gameplay balance, generally, each attachment or modification improves some attributes and worsens others.

For example, a short-barrelled MP5K will be more manoeuvrable than a regular MP5, but it will suffer from high recoil.[^2] Depending on how you play, this might be an acceptable tradeoff.

To proceed, the key insight we need is to recognize that choosing a loadout is the same as solving a microeconomic optimization problem. Effectively, we seek to maximize a player’s [utility](https://en.wikipedia.org/wiki/Utility) subject to cost constraints imposed by game mechanics. Here, utility describes the increased performance a player derives from using their preferred loadout.

## Weapon Utility

Let's model utility $U$ as a function of the weapon attributes, represented as a vector $\mathbf{x}$.

Game mechanics dictate that the model should have the following properties:

1. Each attribute $x_i$ contributes independently to an increase in utility[^3]

$$
U(\mathbf{x}) = \displaystyle\sum_i U_i(x_i)
$$

2. For a given attribute, larger values are always preferred to smaller ones

$$
\dfrac{\partial U}{\partial x_i} > 0 \ \forall \ i
$$

Note that the second property corresponds to the non-satiation assumption in utility theory.

The attribute vector itself comprises a base term $\mathbf{x_0}$ and the sum of contributions from attachments. If we denote the presence of the _j-th_ attachment in the _i-th_ slot by a boolean variable $X_{ij} \in \{0, 1\}$, we can then write

$$
\mathbf{x} = \mathbf{x_0} + \displaystyle\sum_i^m \displaystyle\sum_j^{n_i} X_{ij}\mathbf{\Delta x}_{ij}
$$

Apart from the integrality constraint on $X_{ij}$, there are two other constraints to state:

1. Game mechanics mean we are restricted to making five modifications

$$
\displaystyle\sum_i^m \displaystyle\sum_j^{n_i} X_{ij} \leq 5
$$

2. We cannot make more than one modification in the same place or "slot"

$$
\displaystyle\sum_j^{n_i} X_{ij} \leq 1 \ \forall \ i
$$

## Combinatorial optimization

[Combinatorics](https://en.wikipedia.org/wiki/Combinatorics) can be used to gauge the size of the problem we are trying to solve.

Suppose every slot supports at least three modifications, and every weapon has at least five slots, so that $n_i \geq 3 \ \forall \ i$, and $m \geq 5$. Then we can obtain a lower bound for $N$, the number of distinct ways of modifying a typical weapon:

$$
\begin{aligned}
  N   &\geq \displaystyle\sum_{k=0}^5 \dfrac{m!}{k!(m-k)!} 3^k \\
      &\geq \displaystyle\sum_{k=0}^5 \dfrac{5!}{k!(5-k)!} 3^k \\
      &= (1+3)^5 = 1024
\end{aligned}
$$

Note that we used the [binomial theorem](https://en.wikipedia.org/wiki/Binomial_theorem) to derive the last line.

Now suppose $n_i \leq 9 \ \forall \ i$, and $m \leq 7$, again for all weapons. This leads us to an upper bound for $N$:

$$
\begin{aligned}
    N   &\leq \displaystyle\sum_{k=0}^5 \dfrac{m!}{k!(m-k)!} 9^k \\
        &= \dfrac{m!}{5!}\displaystyle\sum_{k=0}^5 \dfrac{5!}{k!(m-k)!} 9^k \\
        &\leq \dfrac{m!}{5!}\displaystyle\sum_{k=0}^5 \dfrac{5!}{k!(5-k)!} 9^k \\
        &= \dfrac{7!}{5!}(1+9)^5 = 4,200,000
\end{aligned}
$$

There are few slots supporting nine modifications in practice, so our bound for $N$ should be tighter.[^4]

To get further, we need to propose a form for utility, our objective function. Composing it from a weighted sum of attribute contributions is a simple and intuitive model. More importantly, it will transform the problem into a tractable one that does not demand a brute force solution.

$$
\begin{aligned}
  U(\mathbf{x}) &= \displaystyle\sum_i U_i(x_i) \\
                &= \displaystyle\sum_i u_ix_i \\
                &= \mathbf{u} \cdot \mathbf{x}
\end{aligned}
$$

Every utility coefficient $u_i$ needs to be positive to satisfy the non-satiation assumption.

## The Knapsack Problem

Observe that maximizing the original objective $U$ is the same as maximizing a transformed one $U'$:

$$
\begin{aligned}
  U'(\mathbf{x}) &= U(\mathbf{x}) - \mathbf{u} \cdot \mathbf{x_0} \\
                 &= \mathbf{u} \cdot \left(\displaystyle\sum_i^m \displaystyle\sum_j^{n_i} X_{ij}\mathbf{\Delta x}_{ij}  \right) \\
                 &= \displaystyle\sum_i^m \displaystyle\sum_j^{n_i} X_{ij} \times \mathbf{u} \cdot \mathbf{\Delta x}_{ij} \\
                 &= \displaystyle\sum_i^m \displaystyle\sum_j^{n_i} P_{ij} X_{ij}
\end{aligned}
$$

Restating the whole problem, with constraints, for completeness:

$$
  \max \displaystyle\sum_i^m \displaystyle\sum_j^{n_i} P_{ij}X_{ij}
$$

subject to

$$
\begin{aligned}
  \displaystyle\sum_i^m \displaystyle\sum_j^{n_i} X_{ij} &\leq 5 \\
  \displaystyle\sum_j^{n_i} X_{ij} &\leq 1 \ \forall \ i \\
  X_{ij} &\in \{0, 1\} \ \forall \ i, j
\end{aligned}
$$

where $P_{ij} = \mathbf{u} \cdot \mathbf{\Delta x}_{ij}$.[^5]

Thus the optimization problem reduces to a variant of the Multiple-Choice [Knapsack Problem](https://en.wikipedia.org/wiki/Knapsack_problem) where each "price" $P_{ij}$ may be real-valued, but all the "objects" have the same weight -- 1.

This simplification, courtesy of the problem domain, enables us to devise a simpler optimization algorithm to solve the Multiple-Choice Knapsack Problem than those reported in research papers.[^6]

1. Sort the modifications in descending order of price `P[i][j]`
2. While modification slots are still available, select the next modification `(i, j)` provided:
   - its slot `i` is vacant
   - its price `P[i][j]` is positive

The runtime of this algorithm is dominated by sorting, which can be done in linearithmic time. Memory usage is linear in the number of available modifications. The following Java code implements this algorithm and incorporates a couple of practical improvements:

```java
public class WeaponOptimizer implements Optimizer<Weapon, Loadout> {
  private final List<Double> utilityCoefficients;

  public WeaponOptimizer(List<Double> utilityCoefficients) {
    this.utilityCoefficients = utilityCoefficients;
  }

  @Override
  public Pair<Double, Loadout> run(Weapon weapon) {
    var attachments = new ArrayList<Triple<Slot, Attachment, Double>>();
    for (var slot : weapon.slots()) {
      for (var attachment : slot.availableAttachments()) {
        var price = attachment.price(utilityCoefficients);
        // Disregard attachments with negative prices from the outset
        if (price > 0) {
          // Cache the computed price for sorting later
          attachments.add(new Triple<>(slot, attachment, price));
        }
      }
    }
    attachments.sort(priceComparator.reversed());

    var utility = weapon.utility(utilityCoefficients);
    var loadout = new Loadout(weapon);

    for (var triple : attachments) {
      var slot = triple.first();
      var attachment = triple.second();
      var price = triple.third();
      if (loadout.isFull()) {
        break;
      }
      if (!loadout.containsAttachment(slot)) {
        utility += price;
        loadout.putAttachment(slot, attachment);
      }
    }
    return new Pair<>(utility, loadout);
  }
}

```

Price and base utility calculators are namespaced in `Attachment` and `Weapon`, respectively:

```java
public record Attachment(List<Double> attributes) {
  /**
   * Contribution of this attachment to weapon utility.
   */
  public double price(List<Double> utilityCoefficients) {
    var total = 0;
    for (var i = 0; i < attributes.size(); i++) {
      total += utilityCoefficients.get(i) * attributes.get(i);
    }
    return total;
  }
}

public record Slot(Set<Attachment> availableAttachments) {}

public record Weapon(List<Double> attributes, Set<Slot> slots) {
  /**
   * Base utility of a weapon.
   */
  public double utility(List<Double> utilityCoefficients) {
    var total = 0;
    for (var i = 0; i < attributes.size(); i++) {
      total += utilityCoefficients.get(i) * attributes.get(i);
    }
    return total;
  }
}

```

`Loadout` is a class that enforces game mechanics; i.e. it makes sure we can never

1. populate a slot with a foreign attachment, or
2. add more than five attachments to the weapon, or
3. populate a slot more than once.

```java
public class Loadout {
  public static final int MAX_ATTACHMENTS = 5;
  public final Weapon weapon;
  private final HashMap<Slot, Attachment> attachments = new HashMap<>();

  public Loadout(Weapon weapon) {
    this.weapon = weapon;
  }

  public boolean isFull() {
    return attachments.size() == MAX_ATTACHMENTS;
  }

  public boolean containsAttachment(Slot slot) {
    return attachments.containsKey(slot);
  }

  public void putAttachment(Slot slot, Attachment attachment) {
    if (!weapon.slots().contains(slot)) {
      throw new IllegalArgumentException();
    }
    if (!slot.availableAttachments().contains(attachment)) {
      throw new IllegalArgumentException();
    }  // 1
    if (isFull()) {
      throw new UnsupportedOperationException();
    }  // 2
    if (containsAttachment(slot)) {
      throw new UnsupportedOperationException();
    }  // 3
    attachments.put(slot, attachment);
  }
}

```

So far, the algorithm we have devised finds the best loadout for a single weapon. We can do better and determine the best loadout for all weapons.

Observe that attachment choice is tied to weapon choice. So we can decompose the problem by:

1. maximizing utility for every weapon independently (as before), and,
2. finding the weapon in this set with the highest utility.

In Java,

```java
public class LoadoutOptimizer implements Optimizer<List<Weapon>, Loadout> {
  private final Optimizer<Weapon, Loadout> weaponOptimizer;

  public LoadoutOptimizer(Optimizer<Weapon, Loadout> weaponOptimizer) {
    this.weaponOptimizer = weaponOptimizer;
  }

  @Override
  public Pair<Double, Loadout> run(List<Weapon> weapons) {
    return weapons
      .stream()
      .map(weaponOptimizer::run)
      .max(Comparator.comparing(Pair::first))
      .orElseThrow(IllegalArgumentException::new);
  }
}

```

This optimizer accepts _any_ underlying optimizer conforming to the `Optimizer<Weapon, Loadout>` interface, so we can [stub](https://en.wikipedia.org/wiki/Method_stub) out `WeaponOptimizer` when testing `LoadoutOptimizer`.

## Model correctness

It is difficult to verify the usefulness of applying utility theory in this context mainly because of the lack of in-game weapon data. When I wrote this article, most weapon data reported online for Modern Warfare was obtained experimentally. It was also far from complete.

[^1]: This is the case in real life, too.
[^2]: The K in [MP5K](https://www.heckler-koch.com/en/products/military/submachine-guns/mp5/mp5k/overview.html) stands for _Kurz_, German for "short."
[^3]:
    For the sake of gameplay balance, this might not be entirely true. I bet the game won't allow you to eliminate recoil by stacking every recoil-reducing attachment on a weapon.

    Also, some modifications prevent others from being made: for instance, you cannot attach a compensator to the muzzle of an [MP5SD](https://www.heckler-koch.com/en/products/military/submachine-guns/mp5/mp5sd/overview.html) because it has a sound suppressor built directly into its receiver. These exceptions are rare enough that we can ignore them.

[^4]: Either way, $N$ is a large number.
[^5]: $P_{ij}$ is the additional utility we derive from having the _j-th_ slot populated with the _i-th_ attachment.
[^6]: Research papers like [Bednarczuk E. (2018)](https://doi.org/10.1007/s10589-018-9988-z) and [Pisinger D. (1995)](https://doi.org/10.1016/0377-2217%2895%2900015-I).
