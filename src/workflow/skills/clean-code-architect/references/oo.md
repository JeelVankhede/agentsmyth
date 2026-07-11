# Object-Oriented

## Principles

- **Depend on abstractions the caller defines, not concrete implementations the callee owns**
  (dependency inversion). A high-level module should not import a low-level module's concrete
  class directly when an interface/protocol would let either side change independently.
- **A class should have one reason to change.** If describing a class's responsibility requires
  "and," it likely has more than one axis of change bundled together — split along those axes, not
  along arbitrary size.
- **Composition over inheritance for behavior reuse.** Inheritance couples subclass and superclass
  tightly (a superclass change can break every subclass); composition (holding a reference to a
  collaborator) is more flexible and usually the better default unless there's a genuine
  is-a relationship with stable shared behavior.
- **Favor immutability for value-like objects.** An object representing a value (money, a
  coordinate, a date range) with no independent identity should be immutable — eliminates a whole
  class of aliasing bugs where one holder's mutation surprises another.

## Common Pitfalls

- God objects/classes that accumulate unrelated responsibilities because they're the easiest place
  to add "one more thing."
- Deep inheritance hierarchies (more than 2-3 levels) that make it hard to reason about which
  ancestor actually defines a given behavior.
- Public mutable fields with no invariant protection — any caller can put the object into an
  inconsistent state.
- Constructors that do real work (I/O, heavy computation) instead of just establishing invariants —
  makes the class hard to test and its cost surprising.

## Checklist

- [ ] New classes have a single, describable responsibility.
- [ ] Behavior reuse uses composition unless a genuine, stable is-a relationship justifies inheritance.
- [ ] Value-like objects are immutable.
- [ ] Public state is protected by the class's own invariants, not left open for any caller to corrupt.
- [ ] Constructors establish state without doing real work (I/O, heavy computation).
