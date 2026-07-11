# Monolith

## Principles

- **Module boundaries inside a monolith are a discipline choice, not a physical one.** Nothing
  stops one module from importing another's internals — the boundary only holds if the codebase
  enforces it (linting rules, package-private conventions, code review). Treat an internal module
  boundary with the same seriousness as an external service boundary, since it's the thing standing
  between "modular monolith" and "big ball of mud."
- **Dependency direction should point toward stability.** Shared/core modules (auth, config, data
  access) should not import from feature modules — feature modules depend on core, never the
  reverse. A dependency pointing the wrong way is usually the first sign a boundary is about to
  erode.
- **A monolith's single deploy unit means a bad change affects everything at once.** There's no
  natural blast-radius containment from process isolation — that has to come from code-level
  isolation (module boundaries) and deployment practice (feature flags, staged rollout).
- **Shared mutable state across modules is the main way monolith modularity erodes over time.** A
  shared in-memory cache, a shared global, a shared database table two "separate" modules both
  write to — these silently couple modules that look separate in the directory structure.

## Common Pitfalls

- A "core" or "shared" module that keeps growing because it's the easiest place to put anything
  used by two or more features — eventually becomes its own tangled dependency the whole app leans on.
- Feature modules directly querying another feature's database tables instead of going through that
  feature's own interface — couples the two at the schema level, invisible at the code level.
- No enforced boundary at all (every module can `import` any internal path of any other module) —
  relying purely on convention/documentation without any linting or build-time enforcement.
- Treating "it's all one deploy anyway" as a reason to skip designing an interface between modules —
  the interface still matters for comprehension, testing, and future extraction.

## Checklist

- [ ] New code respects existing module boundaries — no reaching into another module's internals.
- [ ] Dependency direction points toward shared/stable modules, never the reverse.
- [ ] No new shared mutable state is introduced across module boundaries without an explicit owner.
- [ ] If a "core"/"shared" module is being extended, confirm the addition is genuinely
      cross-cutting, not a single feature's concern misplaced there.
