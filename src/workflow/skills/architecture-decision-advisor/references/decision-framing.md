# Decision Framing

How to frame alternatives so the recorded decision is genuinely useful to a future reader, not a
formality that gets written after the fact to justify what was already done.

1. **Name the axis of the decision, not just the options.** "REST vs. GraphQL" is not itself the
   decision — the axis might be "client flexibility vs. server-side query complexity," and naming
   that axis is what makes the recorded rationale reusable for the *next* similar decision.

2. **The rejected alternative must be a real one, not a strawman.** If the only alternative named
   is obviously worse in every dimension, the "decision" was not actually contested — say so
   plainly ("no genuine alternative existed; the chosen approach was the only repo-consistent
   option") rather than inventing a weak alternative to satisfy the Exit Gate's letter.

3. **Rationale must be falsifiable.** "This is cleaner" is not a rationale. "This keeps the new
   module's dependencies flowing the same direction as every existing module in this layer
   (`repo-profile.yaml`'s documented boundary)" is — a future reader could check whether that claim
   is still true.

4. **When the decision is genuinely close, say so.** Recording "both approaches were
   repo-consistent; chose A for a minor maintainability edge, B remains a reasonable alternative if
   requirements shift" is more honest and more useful than manufacturing false confidence.

5. **Whole-repo, not local.** The point of this skill is considering impact beyond the immediate
   diff — a decision framed purely in terms of "what's easiest for this one file" has not actually
   done the whole-repo analysis this skill exists to force.
