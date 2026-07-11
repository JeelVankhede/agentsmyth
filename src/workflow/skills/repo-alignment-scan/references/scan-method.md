# Scan Method

What "inspect the actual repo" means concretely, and how to compare it against a requirement.

1. **Locate the nearest existing precedent.** Search for files/directories that already do the
   same *kind* of thing the requirement describes (same layer, same pattern, same integration
   point) — not a keyword match on the requirement's wording, a structural match on what it's
   asking for. Example: a requirement to "add a new CLI subcommand" should search for how existing
   subcommands are structured (one file per command? a dispatch table? a single large switch?),
   not just grep for the word "command."

2. **Read `repo-profile.yaml` for documented roots.** `paths.protected`, `paths.public_contracts`,
   `paths.generated_outputs`, and `repository.workflow_root`/`artifacts_root` name authoritative
   locations — a requirement that implies a different location for the same kind of file is a real
   misalignment, not a style preference.

3. **Check for a second, competing convention.** If two existing precedents do the same kind of
   thing two different ways, the requirement inherits that ambiguity — this is a `Q` for the user,
   not a coin flip the skill makes silently, unless one precedent is demonstrably deprecated
   (e.g., superseded by a later commit, marked legacy in a comment, or excluded from the build).

4. **Distinguish "new to the repo" from "new to this specific area."** A genuinely new capability
   (no precedent anywhere) is not itself a misalignment — it's `new_surface`, which is a scoring
   signal, not a Refusal condition. Only flag misalignment when the requirement's assumptions
   actively conflict with something that already exists.

5. **Cite what you found, not what you searched for.** "No existing precedent found for X" is only
   a valid finding after actually searching (grep, directory listing, or targeted read) — not
   inferred from the requirement's own framing.
