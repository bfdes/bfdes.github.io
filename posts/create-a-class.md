---
title: Create-A-Class
tags: [Optimisation]
created: 2019-12-05
summary: Applying combinatorial optimisation to competitive multiplayer video game strategy
---

This post is about applying combinatorial optimisation to the weapon modification system "Create-A-Class" present in the multiplayer mode of the recently released Call Of Duty game Modern Warfare.

For those who are not aware, in Call Of Duty games, players are pit against each other in deathmatch or objective capture game modes. Good gunplay and weapon customisation is an important part of the competitive multiplayer experience.

Modern Warfare takes weapon customisation a step further than its predecessors, enabling players to modify weapons extensively in the [Gunsmith](https://blog.activision.com/call-of-duty/2019-09/A-Deeper-Look-at-Modern-Warfare-Customization) component of "Create-A-Class." I wondered whether it would be possible to determine the optimal modifications for a weapon without inspecting every permutation of attachments. Spoiler: There are a LOT of choices!

## Gunsmith

In the game world, each weapon has a set of base attributes that define how it handles. These include, but are not limited to, the range of the weapon, its damage and the recoil it imparts.

In Gunsmith, players can modify up to five different places on a weapon. For the sake of gameplay balance, generally, each attachment or modification improves some attributes and worsens others.

This optimisation problem mirrors a microeconomic one. Effectively, we seek to maximise a player’s [utility](https://www.investopedia.com/terms/u/utility.asp) subject to cost constraints imposed by game mechanics. Here, utility describes the increased performance a player derives from using their preferred weapon loadout.

## Player Utility

In this model, utility $U$ is a function of the weapon attributes, represented as a vector $\mathbf{x}$. Game mechanics dictate that the model should have the following properties:

1. Each attribute $x_i$ contributes independently to an increase in utility

$$
U(\mathbf{x}) = \displaystyle\sum_i U_i(x_i)
$$

2. For a given attribute, larger values are always preferred to smaller ones

$$
\dfrac{\partial U}{\partial x_i} = \dfrac{\partial U_i}{\partial x_i} > 0 \ \forall \ i
$$

The second property corresponds to the non-satiation assumption in utility theory.

The attribute vector itself comprises of a base term $\mathbf{x_0}$ and the sum of attachment contributions. If we denote the presence of the _j-th_ attachment in the _i-th_ slot by a boolean variable $X_{ij} \in \{0, 1\}$, we can then write

$$
\mathbf{x} = \mathbf{x_0} + \displaystyle\sum_i^m \displaystyle\sum_j^{n_i} X_{ij}\mathbf{\Delta x}_{ij}
$$

Apart from the integrality constraint, there are two other limits to state:

- Gameplay mechanics mean we are restricted to making five modifications

  $$
  \displaystyle\sum_i^m \displaystyle\sum_j^{n_i} X_{ij} \leq 5
  $$

- We cannot make more than one modification in the same place

  $$
  \displaystyle\sum_j^{n_i} X_{ij} \leq 1 \ \forall \ i
  $$

Note that we can assume, without any loss of generality, that the player has fully ranked a weapon so that every attachment is available.

Combinatorics can be used to get an idea of the number of loadouts $N$ for a typical weapon.

Suppose every slot supports at least three modifications, and every weapon has at least five slots, so that $n_i \geq 3 \ \forall \ i$, and $m \geq 5$. Then we can obtain a lower bound:

$$
\begin{aligned}
  N   &\geq \displaystyle\sum_{k=0}^5 \dfrac{m!}{k!(m-k)!} 3^k \\
      &\geq \displaystyle\sum_{k=0}^5 \dfrac{5!}{k!(5-k)!} 3^k \\
      &= (1+3)^5 = 1024
\end{aligned}
$$

Note: The binomial theorem was used to derive the last line.

Now suppose $n_i \leq 9 \ \forall \ i$, and $m \leq 7$, again for all weapons. This leads us to an upper bound:

$$
\begin{aligned}
    N   &\leq \displaystyle\sum_{k=0}^5 \dfrac{m!}{k!(m-k)!} 9^k \\
        &= \dfrac{m!}{5!}\displaystyle\sum_{k=0}^5 \dfrac{5!}{k!(m-k)!} 9^k \\
        &\leq \dfrac{m!}{5!}\displaystyle\sum_{k=0}^5 \dfrac{5!}{k!(5-k)!} 9^k \\
        &= \dfrac{7!}{5!}(1+9)^5 = 4,200,000
\end{aligned}
$$

In practice, the are many slots supporting fewer than nine attachments, and our bound on $N$ ends up being tighter.

To get further, we need to propose a form for utility, our objective function. Composing it from a weighted sum of attribute contributions is a simple and intuitive model. More importantly, it will allow us to transform the problem into more tractable one later -- one which does not require us to evaluate every combination of attachments!

$$
\begin{aligned}
  U(\mathbf{x}) &= \displaystyle\sum_i U_i(x_i) \\
                &= \displaystyle\sum_i u_ix_i \\
                &= \mathbf{u} \cdot \mathbf{x}
\end{aligned}
$$

Every utility coefficient $u_i$ needs to be positive; based on what we have said before, can you see why?

Apart from advancing a particular utility model for every player, we made some other assumptions implicitly:

- Modifications can be made independently of each other
- All modifications imbue characteristics that can be modelled as changes to weapon attributes

Of these, the first assumption is the hardest one to reconcile with our model. Although one modification rarely prevents another from being made entirely, there are suspicions that their combined effect on weapon attributes is not merely additive.

## The Knapsack Problem

Observe that maximising the original objective $U$ is the same as maximising a transformed one $U'$:

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

Thus the optimisation problem reduces to a variant of the Multiple-Choice [Knapsack Problem](https://en.wikipedia.org/wiki/Knapsack_problem) where each "price" $P_{ij}$ may be real-valued, but all the "objects" have the same weight -- 1.

This simplification, courtesy of the problem domain, enables us to devise a simpler optimisation algorithm to solve the Multiple-Choice Knapsack Problem than those reported in research papers, such as [Bednarczuk E. (2018)](https://doi.org/10.1007/s10589-018-9988-z) and [Pisinger D. (1995)](https://doi.org/10.1016/0377-2217%2895%2900015-I).

1. Sort the modifications in descending order of price `P[i][j]`
2. While modification slots are still available, select the next modification `(i, j)` provided:
   - its slot `i` is vacant
   - its price `P[i][j]` is positive

The runtime of this algorithm is dominated by the sorting, which can be done in linearithmic time. Memory usage is linear in the number of available modifications. The following Modern Java code implements this algorithm, and incorporates a couple of practical improvements:

```java
public class WeaponOptimizer implements Optimizer<Weapon, Loadout> {
  private static final Comparator<Triple<Slot, Attachment, Double>> byPrice =
      Comparator.comparing(Triple::third);

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
    attachments.sort(byPrice.reversed());

    var utility = weapon.utility(utilityCoefficients);
    var chosenAttachments = new ChosenAttachments();

    for (var triple : attachments) {
      var slot = triple.first();
      var attachment = triple.second();
      var price = triple.third();
      if (chosenAttachments.isFull()) {
        break;
      }
      if (!chosenAttachments.containsKey(slot)) {
        chosenAttachments.put(slot, attachment);
        utility += price;
      }
    }
    var loadout = new Loadout(weapon, chosenAttachments);
    return new Pair<>(utility, loadout);
  }
}
```

Notice the use of a generic interface `Optimizer`, defined as

```java
public interface Optimizer<I, O> {
  Pair<Double, O> run(I input);
}
```

We also rely on records `Attachment`, `Slot`, and `Weapon` to encapsulate domain interactions:

```java
public record Attachment(List<Double> attributes) {
  /**
   * Contribution of this attachment to weapon utility.
   */
  public double price(List<Double> utilityCoefficients) {
    if (utilityCoefficients.size() != attributes.size()) {
      throw new IllegalArgumentException();
    }
    var total = 0;
    for(var i=0; i < attributes.size(); i++) {
      total += utilityCoefficients.get(i) * attributes.get(i);
    }
    return total;
  }
}

public record Slot(Set<Attachment> availableAttachments){}

public record Weapon(List<Double> attributes, Set<Slot> slots) {
  /**
   * Base utility of a weapon.
   */
  public double utility(List<Double> utilityCoefficients) {
    if (utilityCoefficients.size() != attributes.size()) {
      throw new IllegalArgumentException();
    }
    var total = 0;
    for(var i=0; i < attributes.size(); i++) {
      total += utilityCoefficients.get(i) * attributes.get(i);
    }
    return total;
  }
}

public record Loadout(Weapon weapon, ChosenAttachments chosenAttachments) {
  public Optional<Attachment> chosenAttachment(Slot slot) {
    var attachment =  chosenAttachments.get(slot);
    return attachment == null ? Optional.empty() : Optional.of(attachment);
  }
}
```

In `Loadout`, `ChosenAttachments` is simply a `HashMap` that enforces game mechanics:

```java
public class ChosenAttachments extends HashMap<Slot, Attachment> {
  public static final int MAX_ALLOWED = 5;

  @Override
  public Attachment put(Slot slot, Attachment attachment) {
    // One attachment per slot...
    if (isFull()) {
      var msg = String.format("up to %s attachments permitted", MAX_ALLOWED);
      throw new UnsupportedOperationException(msg);
    }
    return super.put(slot, attachment);
  }

  public boolean isFull() {
    // ...and up to five attachments in total permitted
    return size() == MAX_ALLOWED;
  }
}
```

## Loadouts and Classes

So far, the algorithm we have devised finds the best **loadout** for a playstyle, _given_ a weapon. We can do better and determine the best loadout among all weapon and attachment permutations.

Observe that attachment choice is tied to weapon choice. So we can decompose the problem by:

1. maximising utility for every weapon independently (as before), and,
2. finding the weapon in this set with the largest utility.

In Java,

```java
public class LoadoutOptimizer implements Optimizer<List<Weapon>, Loadout> {
  private static final Comparator<Pair<Double, Loadout>> byUtility =
      Comparator.comparing(Pair::first);

  private final Optimizer<Weapon, Loadout> weaponOptimizer;

  public LoadoutOptimizer(Optimizer<Weapon, Loadout> weaponOptimizer) {
    this.weaponOptimizer = weaponOptimizer;
  }

  @Override
  public Pair<Double, Loadout> run(List<Weapon> weapons) {
    return weapons.stream()
        .map(weaponOptimizer::run)
        .max(byUtility)
        .orElseThrow(() -> new IllegalArgumentException("no weapons supplied"));
  }
}
```

Note that this optimizer accepts _any_ underlying weapon optimizer conforming to the `Optimizer<Weapon, Loadout>` interface. Stub implementations can be readily inserted to run tests that only check the behaviour of code in `LoadoutOptimizer`.

The algorithm is efficient only because there are a limited number of weapons in-game (about 30). As a result, it could run directly in the request threads of a web service designed to respond to queries for the best loadout. It is not limited to running as part of a CLI program or asynchronous batch job.

A **class** is typically comprised of:

- A long gun
- A sidearm
- Two pieces of explosive or tactical equipment
- Three "Perks" (special abilities)

Optimising for the best class is more of an art than a science. For this reason, it is not worth attempting.

## Model correctness

It is difficult to verify the usefulness of applying utility-theory in this context mainly because of the lack of in-game weapon data. At the time of writing this article, most weapon data [reported online](https://www.reddit.com/r/modernwarfare/comments/dslu8z/modern_warfare_2019_weapon_damage_guide_excel) for Modern Warfare has been obtained experimentally and is far from being exhaustive.

Additionally, recall that modifications do not have independent effects; this makes it harder to determine raw weapon data from experiments.
