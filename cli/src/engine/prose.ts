// Text-analysis primitives for the governance-prose-clarity checks
// (EXP-0001, F-III pre-registered — see experiments/0001-governance-prose-clarity.md).
// Pure functions only: no I/O, no knowledge of Finding/audit. Consumed by
// audit.ts against Article.principle/.fitness/.why, Statute.rule/.why,
// Adr.body, and LedgerEntry.body.
//
//   raw field text
//     │
//     ▼
//   stripInlineMarkup()  — drop `code spans` and [link](url) syntax (keeps
//                          link text) so a long URL or an inline `status: X`
//                          snippet never inflates a word/sentence count
//     │
//     ├──► countWords()          ── LEDGER-LENGTH (a size cap, not a style check)
//     ├──► sentenceLengths()     ── PROSE-SENTENCE-LEN (per-sentence word count)
//     └──► hasStackedQualifier() ── PROSE-STACKED-QUALIFIER (field-level: 2+
//                                   DISTINCT qualifier patterns anywhere in the
//                                   field, not required within one sentence —
//                                   the real F-II example stacks an em-dash
//                                   aside in one clause with an "exception"
//                                   clause in another, within the same bullet)

// Strips backtick code spans and markdown link syntax (kept: the link text,
// dropped: the URL) before any word/sentence analysis. Without this, a long
// URL counts as one giant "word" and an inline `field: VALUE` snippet can
// trip the stacked-qualifier check for reasons that have nothing to do with
// prose style — a known false-positive class for regex-based prose checks
// on raw markdown.
export function stripInlineMarkup(text: string): string {
  return text.replace(/`[^`]*`/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
}

export function countWords(text: string): number {
  const stripped = stripInlineMarkup(text).trim();
  if (!stripped) return 0;
  return stripped.split(/\s+/).filter(Boolean).length;
}

// Splits on `.`/`!`/`?` followed by whitespace and an UPPERCASE letter (or
// end of string) — deliberately simple, not full sentence-boundary
// detection. Requiring an uppercase letter after the break is what keeps a
// numbered list ("... exactly one home: 1. the instance's own ... 2. the
// framework spec ...") from being sliced into meaningless fragments — it
// reads as one long sentence instead, which is the point: a numbered list is
// not itself convoluted, but a 50+ word run-on hiding inside one is exactly
// what this check exists to catch. Known, accepted limitation: an
// abbreviation followed by a capitalized word ("e.g. Foo does X") can still
// false-split; not fixed here — a genuine sentence-boundary detector is out
// of scope for this narrow check (see NOT in scope, eng review).
export function sentenceLengths(text: string): number[] {
  const stripped = stripInlineMarkup(text).trim();
  if (!stripped) return [];
  const parts = stripped.split(/(?<=[.!?])\s+(?=[A-Z])/);
  return parts.map((s) => countWords(s));
}

const QUALIFIER_PATTERNS: RegExp[] = [
  /\s—\s/, // em-dash used as a clause-setting aside
  /\b(except|unless|scoped to|exception)\b/i, // scope-narrowing clause
  /\([^()]*\([^()]*\)[^()]*\)/, // a parenthetical nested inside another
];

// True only when 2+ DISTINCT pattern types appear somewhere in the field —
// not "the same pattern twice." A field enumerating N related facts (e.g. a
// numbered list, or a single em-dash aside on its own) is not itself
// convoluted; qualifier stacked on qualifier is. Checked at the FIELD level
// (the whole Principle/Fitness/Why/rule/body string), not per-sentence: the
// real calibration example (F-II's current Principle) stacks an em-dash
// aside in one clause with an "exception" clause in a different sentence of
// the same bullet — no single sentence contains both.
export function hasStackedQualifier(text: string): boolean {
  const stripped = stripInlineMarkup(text);
  return QUALIFIER_PATTERNS.filter((re) => re.test(stripped)).length >= 2;
}
