# Integration

## Principles

- **Integration tests exist to catch what unit tests structurally cannot: real component
  boundaries.** A change that only adds/modifies unit tests but touches a real boundary (a new
  database query, a new external API call, a new cross-module interaction) has an integration-test
  gap even if unit coverage looks complete.
- **A "passing" integration test that mocks the actual boundary it claims to test isn't an
  integration test.** If the database, external API, or cross-service call is mocked/stubbed, the
  test is validating the mock's behavior, not the real integration — adequate integration testing
  needs the real (or a realistic, faithful) dependency in the loop.
- **Integration tests should cover the failure modes of the boundary, not just the success path.**
  What happens when the database is unreachable, the external API returns an unexpected shape, or
  the cross-service call times out — these are exactly the scenarios unit tests with mocked
  dependencies tend to skip.
- **Test environment parity matters.** An integration test that passes against a test-environment
  configuration meaningfully different from production (different database version, different
  network topology) provides weaker adequacy than one that mirrors production more closely.

## What "Adequate" Means Here

- Every new real boundary this change introduces or modifies (database query, external call,
  cross-module/cross-service interaction) has at least one integration test exercising the real
  dependency, not a mock of it.
- At least one failure-mode scenario for each new boundary is tested (timeout, unexpected response,
  unavailable dependency), not only the success path.

## Checklist

- [ ] Every new/changed real boundary in this diff has an integration test using the real (or realistically faithful) dependency, not a mock.
- [ ] At least one failure-mode scenario is tested per new boundary.
- [ ] The integration test environment is reasonably representative of production for the aspect being tested.
