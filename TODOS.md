# TODOS

## Governance Engine

### Delta-based ratification gate (Approach C)

**What:** `propose-amendment` computes word-count/complexity of a proposed Article
rewrite against the text it replaces, and refuses to mark a "minor/wording" amendment
ratification-ready if density increased on both axes, without an explicit ratifier
override.

**Why:** the WARN-ONLY prose checks (PROSE-SENTENCE-LEN, PROSE-STACKED-QUALIFIER,
LEDGER-LENGTH) catch dense text once it exists. This would catch the *act* of making an
amendment denser, at the moment it happens — the actual observed failure pattern: every
one of F-II's 3 revisions added density, none removed any.

**Context:** proposed during the EXP-0001 (governance-prose-clarity) design review as a
fast-follow, deliberately deferred until the WARN-ONLY window produces real evidence
about what "denser" should mean numerically. No off-the-shelf tool exists for
text-delta complexity scoring; readability-proxy metrics (Flesch-Kincaid-style) are
blunt for technical/legal prose. Reuses `cli/src/engine/prose.ts`'s word-count
primitives as the delta-comparison input.

**Effort:** L
**Priority:** P2
**Depends on:** EXP-0001 shipping first (this PR) — do not start before that lands and
produces the false-positive-rate evidence this gate's thresholds should be based on.

### Fix parseBoldBullets truncating multi-paragraph bullets at blank lines

**What:** `parseBoldBullets` (`cli/src/engine/parse.ts`) stops capturing a bold-bullet's
continuation text at the first blank line, silently dropping any further paragraphs.

**Why:** discovered while calibrating `PROSE-STACKED-QUALIFIER` against Article F-II —
its actual `Principle` text has a second paragraph ("These three are never compared as
one axis, with one exception...") separated from the preceding numbered list by a blank
line. `Article.principle` silently ends before that paragraph, so the "with one
exception" clause is invisible to every check that reads `.principle`, not just the new
prose checks — `ART-*` checks and anything else consuming that field see a truncated
version of the ratified text.

**Context:** not fixed as part of the governance-prose-brevity work — pre-existing
parser behavior, out of scope for that PR. If a future check needs full multi-paragraph
bullet text, `parseBoldBullets` needs to keep consuming past single blank lines,
stopping only at the next bold-bullet marker or a real section boundary. Touches a
shared, load-bearing parser function every existing check depends on — needs its own
careful test coverage (multi-paragraph bullets, where a blank line legitimately means
"the bullet ended" vs. "just a paragraph break") before changing behavior other checks
silently rely on today.

**Effort:** M
**Priority:** P2
**Depends on:** None

## Completed
