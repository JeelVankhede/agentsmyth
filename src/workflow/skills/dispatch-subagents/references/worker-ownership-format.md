# Worker Ownership Format

Every delegation must define ownership before dispatch.

Required fields:

- phase
- slug/version
- worker role: explorer, worker, or worker-readonly
- ownership: files, directories, risk category, source, or requirement bucket
- manifest IDs
- allowed operations: read-only or write-scoped
- expected output
- validation or evidence expectation
- forbidden actions

Worker prompt requirements:

- Say the worker is not alone in the repo.
- Tell the worker not to revert or overwrite unrelated changes.
- For write work, list the exact write scope.
- For read-only work, explicitly say not to edit files.
- Require exact paths and evidence in the response.
