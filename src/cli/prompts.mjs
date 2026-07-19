// Node-based CLI prompt wrapper around @clack/prompts, compiled into bin/prompts.mjs by
// scripts/build-cli.mjs. Only this hand-written source lives here; the shipped output is a
// self-contained bundle so @clack/prompts stays a devDependency, never a runtime one.
import { cancel, confirm, isCancel } from '@clack/prompts';

// Renders a styled yes/no confirmation. Explicitly defaults to decline on a bare Enter
// (initialValue: false) — the underlying library defaults to true/accept when unset, which
// would silently flip this prompt's safe default for a destructive-action confirmation.
// Returns false (decline) on an explicit cancel (e.g. Ctrl+C) too, the same fail-closed
// default the caller's own non-TTY guard already uses for the same prompt.
export async function confirmPrompt(message) {
  const result = await confirm({ message, initialValue: false });
  if (isCancel(result)) {
    cancel('Cancelled.');
    return false;
  }
  return result;
}
