# Module Boundaries

## Principles

- **A module's public interface is a promise; its internals are not.** What a module exports is
  the contract other code can depend on — everything else should be free to change without
  notifying any caller. If callers reach into a module's internals (deep imports, accessing
  non-exported state), that promise is broken and refactoring becomes risky.
- **High cohesion within a module, low coupling between modules.** Things that change together
  should live together (cohesion); things that change independently should not be forced to know
  about each other's internals (low coupling) — both properties matter, and optimizing only one
  (e.g., splitting everything into tiny modules for "low coupling") can hurt the other.
- **Circular dependencies between modules are a design smell, not a build-tool inconvenience to
  work around.** A cycle usually means two modules are really one concept artificially split, or a
  responsibility is misplaced — resolve it by merging, extracting a shared third module, or moving
  the misplaced responsibility, not by special-casing the import order.
- **A module's size should track its cohesion, not an arbitrary line-count target.** A large module
  where every piece genuinely belongs together (high cohesion) is fine; a small module assembled
  just to hit a size target with no real cohesion is worse than the large one it was split from.

## Common Pitfalls

- Deep imports reaching past a module's declared public entry point into its internal file
  structure — couples callers to internals that were never meant to be a stable contract.
- Splitting a module purely by file size rather than by responsibility, producing several small
  modules that are still tightly coupled to each other (no actual decoupling gained).
- A circular dependency "resolved" by lazy/dynamic imports instead of addressing the underlying
  design issue — defers the problem rather than fixing it.
- A shared "utils" or "common" module that becomes a dumping ground with no cohesive theme,
  effectively defeating module boundaries entirely.

## Checklist

- [ ] Only a module's declared public interface is used by other modules — no deep-imports into internals.
- [ ] New code is placed in the module with the highest cohesion for it, not the most convenient one.
- [ ] No new circular dependency is introduced between modules.
- [ ] A "shared"/"common"/"utils" module addition is genuinely cross-cutting, not a single feature's concern misplaced there.
