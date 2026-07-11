# Layered

## Principles

- **Dependencies point in one direction only.** A layered architecture (presentation → application
  → domain → data-access, or similar) is only meaningful if lower layers never import from higher
  ones — a domain-layer class importing a presentation-layer type is the layering equivalent of a
  circular dependency and defeats the whole point of the split.
- **Each layer has one job and shouldn't do another layer's work.** Presentation formats and
  displays; application orchestrates; domain holds business rules; data-access persists. Business
  logic leaking into a controller/handler (the presentation layer) is a common, gradual violation
  worth catching early.
- **Cross-layer communication uses well-defined interfaces, not leaked implementation details.**
  The data-access layer should expose domain-shaped results, not raw database rows/ORM entities
  leaking up into the domain layer where they don't belong.
- **Not every change needs to touch every layer.** A layered architecture's value is that a
  presentation-only change (reformatting a response) shouldn't require touching domain logic, and
  vice versa — if a "simple" change keeps needing to ripple through every layer, that's a signal the
  layers aren't actually decoupled.

## Common Pitfalls

- A lower layer importing a type or function from a higher layer — even one instance breaks the
  architecture's core guarantee and tends to normalize more violations later.
- Anemic domain layer — all the "domain" objects are just data bags with no behavior, and the
  actual business logic lives in the application or presentation layer instead.
- Data-access layer leaking ORM/database-specific types into the domain layer's public interface.
- A "god" application-layer service that ends up containing what should be domain logic, because
  it's the easiest place to add orchestration code without thinking about where a rule actually belongs.

## Checklist

- [ ] No lower layer imports from a higher layer.
- [ ] Business rules live in the domain layer, not scattered into presentation or application code.
- [ ] Cross-layer boundaries expose domain-shaped interfaces, not leaked implementation types (ORM entities, raw rows).
- [ ] The change's blast radius matches its actual nature — a presentation-only change doesn't ripple into domain logic, and vice versa.
