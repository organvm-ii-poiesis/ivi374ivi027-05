# Canonical Content Editorial Checklist

Use this checklist after running `npm run content:build`.

## Rules
- Preserve stylization and orthography exactly as authored.
- Do not normalize spelling, punctuation, or capitalization.
- Edit only files under `src/content/*.md`.
- Never modify source PDFs in `public/mirror/**`.

## Per-Document Review
- [ ] `preliminary-pages.md`: front matter sequence matches source PDF.
- [ ] `intro.md`: section headings align with intended markers.
- [ ] `sikl-1.md`: paragraph and stanza boundaries preserved.
- [ ] `sikl-2.md`: stylized handles (`@...`) preserved.
- [ ] `sikl-3.md`: punctuation and spacing style retained.
- [ ] `bibliography.md`: references and ordering preserved.

## Spot Checks
- [ ] Randomly sample 5 passages per doc against the source PDF.
- [ ] Confirm no accidental unicode replacement artifacts.
- [ ] Confirm section anchors are unique in rendered reader view.
- [ ] Confirm `src/data/canonical-fidelity-report.json` has no failing docs.

## Sign-off
- Reviewer:
- Date:
- Notes:
