# Public Result Projector Allowlist Specification

**Project:** image_analyzer  
**Date:** 2026-03-01  
**Status:** Draft for implementation

## Purpose

This document defines the allowlist for `public-result-projector`.

Its job is to ensure that public-facing result pages:

- remain consistent with the core analysis result
- are safe for SEO and public browsing
- never expose replay-only, support-only, or debug-only fields

This document operationalizes ADR-03 from the architecture document.

## Scope

This specification applies to:

- content-site analysis result pages
- public SEO pages built from approved task results
- any future syndication or public result export that relies on the same projector

It does not apply to:

- user workspace result pages
- support replay views
- support search summaries
- internal analytics dashboards

## Core Rule

`public-result-projector` must be allowlist-based.

It must never be implemented as:

- “take internal result object and remove a few fields”
- “serialize full replay payload and trust frontend not to render sensitive parts”

It must always be implemented as:

- “construct a new public object from explicitly allowed fields”

## Public Projection Goals

The public projection must:

1. communicate what style was analyzed
2. help search users understand the value of the result
3. create a reliable bridge into the main product flow
4. preserve consistency with the canonical task result
5. avoid leaking debugging or internal operational details

## Source Inputs

The projector may read from:

- `analysis_tasks.result_payload`
- `analysis_tasks.result_summary`
- selected safe task metadata

The projector must not directly consume:

- raw `analysis_stage_snapshots`
- replay-only projections
- support-only projections

## Public Allowlist

### Allowed Top-Level Fields

| Public Field | Source | Notes |
|-------------|--------|-------|
| `public_id` | `analysis_tasks.public_id` | public-safe identifier |
| `title` | derived | SEO/title-safe summary |
| `summary` | derived | short summary of the style analysis |
| `hero_image_url` | approved image asset | only if publication rules allow |
| `style_overview` | derived | plain-language style fingerprint summary |
| `key_style_blocks` | derived | safe, human-readable breakdown of major style traits |
| `prompt_preview` | derived | safe preview, not full debug object |
| `cta` | derived | link / action prompting upload or reuse |
| `seo` | derived | structured metadata for public page |
| `published_at` | task publication metadata | if public |

### Allowed Content Concepts

The public page may include:

- a short title
- a short explanation of the analyzed style
- a readable summary of:
  - composition tendencies
  - lighting tendencies
  - color tendencies
  - texture / finish tendencies
- a safe prompt preview excerpt
- a clear CTA into the product

## Public Field Definitions

### `public_id`

- public-safe identifier or slug
- must not expose internal database sequencing

### `title`

- short, SEO-usable title
- should describe the style outcome, not internal system behavior

### `summary`

- 1-3 sentence public summary
- should explain the aesthetic result in user-readable terms

### `style_overview`

Suggested shape:

```ts
interface PublicStyleOverview {
  camera_language?: string;
  lighting_style?: string;
  color_strategy?: string;
  texture_finish?: string;
  composition_style?: string;
}
```

This is a summarized interpretation, not a full structured dump.

### `key_style_blocks`

Suggested shape:

```ts
interface PublicStyleBlock {
  label: string;
  summary: string;
}
```

Examples:

- `Lighting`
- `Color`
- `Composition`
- `Texture`

### `prompt_preview`

Suggested shape:

```ts
interface PublicPromptPreview {
  adapter_type: 'natural_language' | 'tag_stack' | 'short_command';
  intensity: 'lite' | 'standard' | 'strong';
  excerpt: string;
}
```

Rules:

- excerpt only
- no raw full payload object
- no hidden metadata

### `cta`

Suggested shape:

```ts
interface PublicResultCta {
  label: string;
  href: string;
}
```

### `seo`

Suggested shape:

```ts
interface PublicSeoMetadata {
  title: string;
  description: string;
  canonical_url: string;
  keywords?: string[];
}
```

## Explicit Denylist

The following must never appear in public projection:

- `input_payload`
- `analysis_stage_snapshots`
- replay event history
- raw `objective_description` payload if it contains internal uncertainty/debug detail
- full `style_fingerprint` object dump
- full `controls` object dump
- full `prompt_outputs` object
- full `qa_report`
- `qa_report.issues`
- `qa_report.fixes`
- internal `error_payload`
- support notes
- retry history
- `schema_version`
- `prompt_version`
- provider/model internal routing detail unless explicitly needed and safe
- internal audit or moderation metadata
- user identifiers beyond public-safe presentation rules

## Derived Content Rules

### Rule 1: Summarize, do not dump

Public content should summarize canonical result data into a readable public form.

### Rule 2: Public phrasing must be user-facing

Avoid internal system wording such as:

- “stage snapshot”
- “schema version”
- “retry attempt”
- “QA issue code”
- “provider fallback”

### Rule 3: Public pages must stay faithful to source truth

Do not invent style conclusions that are absent from canonical result.

### Rule 4: Public pages must not expose uncertainty mechanics

If uncertainty exists internally, reflect it through careful phrasing, not by exposing raw uncertainty fields.

## Suggested Output Shape

```ts
interface PublicResultProjection {
  public_id: string;
  title: string;
  summary: string;
  hero_image_url?: string;
  style_overview: PublicStyleOverview;
  key_style_blocks: PublicStyleBlock[];
  prompt_preview?: PublicPromptPreview;
  cta: PublicResultCta;
  seo: PublicSeoMetadata;
  published_at?: string;
}
```

## Publication Preconditions

A task should only be eligible for public projection if:

1. the task is marked `is_public = true`
2. publication approval rules are satisfied
3. projected content does not violate denylist rules
4. required public fields can be derived safely

If these conditions are not met, the projector must refuse publication.

## Implementation Constraints

- `public-result-projector` should live separately from workspace/replay projectors
- projector tests must be denylist-aware
- adding new internal result fields must not automatically change public output
- any new public field must be explicitly reviewed and added to this allowlist

## Testing Requirements

At minimum, add tests for:

1. public projection includes required allowlist fields
2. public projection excludes all denylist fields
3. adding internal replay-only fields does not leak into public output
4. prompt preview remains excerpt-only
5. missing required public-safe data causes projection failure or safe fallback

## Open Questions

1. Should `hero_image_url` always be shown, or only when user/publication consent exists?
2. Should public pages show one adapter preview or multiple adapter previews?
3. Is prompt preview always enabled, or optional by publication policy?

## Recommended Next Step

This allowlist should be referenced directly by:

- content page implementation
- `public-result-projector` tests
- any future public export or syndication logic
