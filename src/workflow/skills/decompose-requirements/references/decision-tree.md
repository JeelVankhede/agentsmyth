# Decision Tree

Use this order when decomposing requirements:

1. If the request is Trivial and no manifest is requested, return no-op.
2. If no brief exists, produce a proposed manifest for Think.
3. If a brief exists without a manifest, backfill the manifest.
4. If a brief has a manifest and the request adds scope, append new IDs.
5. If the request changes existing requirements materially, recommend a new version.
6. If the user answered `Q` IDs, update those questions and blockers without renumbering.
7. If the manifest is complete and unchanged, return no-op.

Always choose stability over cosmetic ordering. Existing IDs remain permanent once downstream artifacts may cite them.
