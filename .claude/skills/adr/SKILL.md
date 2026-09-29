---
name: adr
description: >-
  Record an architecture decision for Shift Relay in docs/decisions/. Use when
  the user says /adr, record this decision, why did we choose, or when adding a
  dependency or pattern that shapes the architecture.
---

# ADR — record a decision

`/adr {short title}`

1. Read [docs/decisions/README.md](../../../docs/decisions/README.md). The next number is the highest existing one + 1, zero-padded to four digits.
2. Write `docs/decisions/{NNNN}-{kebab-title}.md`:

   ```
   # NNNN — Title

   Status: Proposed · YYYY-MM-DD

   ## Context
   What forces the decision: facts, constraints, the brief. 2–4 sentences.

   ## Decision
   What we do, as bullets. Name versions only if checked today.

   ## Consequences
   - What gets easier
   - What gets harder or is traded away
   - Rejected alternatives and why, one line each
   ```

3. Add a row to the README table.
4. Status stays **Proposed** until the human accepts it. To supersede an old ADR, the new one says `Supersedes NNNN` and the old one's status becomes `Superseded by NNNN`. The old Decision section is not edited.

Keep it under a page. An ADR is for the interviewer who asks "why did you do it this way?"
