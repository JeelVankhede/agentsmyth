# Detection Method

How to compare pre- and post-refactor control flow for dropped branches, concretely.

1. **Get the real pre-refactor source, not a recollection of it.** Use `git show <base-ref>:<path>`
   or `git diff <base-ref>...HEAD -- <path>` to read the actual pre-refactor code — never rely on
   memory of what the code "probably did," since that is exactly the failure mode this skill exists
   to catch in the agent's own work, not just the user's.

2. **Enumerate branches structurally, not by skimming.** List every `if`, `else if`, `else`,
   `switch`/`case`, early `return`/`throw`/`continue`/`break` inside a guard, and ternary with
   distinct behavior per arm. A branch that's one line is exactly as important to trace as one
   that's twenty.

3. **Match each pre-refactor branch to a post-refactor equivalent by condition, not by position.**
   Code reordering during a refactor is common and not itself a problem — the check is "does this
   specific condition still produce this specific behavior somewhere," not "is line 12 still line 12."

4. **For a merge of two similar functions, build a small truth table.** List the inputs where the
   two pre-refactor versions actually differed in behavior, and confirm the merged version produces
   the correct (origin-appropriate) behavior for each — not just the majority case or the case that
   happened to be the developer's primary test scenario.

5. **Treat a dropped `else` (implicit fallthrough) as a real branch, not "no branch."** Code that
   used to have an explicit `else` doing X and now has no `else` (falling through to whatever
   default the rest of the function does) is still a dropped branch if the new default is not
   equivalent to X — a common way branches disappear silently during "simplification."

6. **When genuinely uncertain whether a drop was intentional, ask rather than guess.** If the diff
   and task artifact give no explicit signal either way, this is a finding to report, not a call to
   make unilaterally in either direction.
