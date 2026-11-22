export const FORMAT_REFERENCE_YAML = `game: { slug: example-game, title: Example Game }
guide:
  slug: full-completion
  title: Full Completion Guide
  author: Someone
  source: https://example.com/guide
sections:
  - id: act-1
    title: Act 1
    body_md: Optional intro shown above the checklist.
    children:
      - id: act-1-town
        title: Town
        items:
          - id: act-1-town-talk-to-mayor
            text: Talk to the mayor
            notes_md: "Unlocks the shop"
            tags: [quest, main]
  - id: reference-tables
    title: Reference
    body_md: |
      | Stat | Max |
      |------|-----|
      | Str  | 99  |`;

export const FORMAT_RULES = [
	'Each uploaded file defines one game and one guide.',
	'Section and item ids must be unique and stable across re-uploads.',
	'A section may contain body_md, child sections, and/or items.',
	'Only items are checkable; progress is tracked per playthrough.',
	'tags are optional free-form strings used for filtering in the UI.'
];