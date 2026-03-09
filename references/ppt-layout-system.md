# PPT layout system

This document defines the rule-driven layout approach for material proposal decks.

The goal is not to let AI place every object freely on a blank slide. The goal is:

1. AI decides slide purpose and content grouping
2. The generator picks a slide archetype
3. The renderer places elements into a controlled layout

## Why this instead of strict client templates

Client templates are useful later, but they are a bad primary dependency for this workflow because:

- candidate image counts are unstable
- aspect ratios are unstable
- asset types are unstable
- some sessions have only fabrics
- some sessions have fabrics plus garment references
- some sessions have trend PDFs but weak product assets

This means a strict template-first flow will fail too often.

## Reference deck observations

The MDL reference deck shows a repeated system, not one-off page design.

The recurring visual language is:

- quiet neutral background
- strong serif titles
- small brand label at the top
- collage-heavy image boards
- fabric detail crops and swatches
- small descriptive text blocks
- color chips as accent metadata

## Core slide archetypes

### 1. `cover`

Use when starting the proposal.

Required elements:

- `title`
- `brand_label`
- `hero_model` or `mood_image`

Optional elements:

- `subtitle`
- `palette_chip`
- `catalogue_index`

### 2. `inspiration_moodboard`

Use when summarizing trend direction or style inspiration.

Required elements:

- 3-6 `mood_image` or `hero_model`
- `section_label`
- `body`

Optional elements:

- 1-2 `fabric_swatch`
- `detail_crop`

Best for:

- trend PDFs
- theme explanation
- style narrative

### 3. `color_reference`

Use when color direction is a first-class message.

Required elements:

- 3-6 dominant visual assets
- `title`
- `palette_chip`

Optional elements:

- short keywords
- one supporting body paragraph

Best for:

- strong seasonal color narratives
- compact transition pages

### 4. `fabric_showcase`

Use when the slide should show what materials or combinations are being proposed.

Required elements:

- 1-2 `fabric_swatch`
- 1-3 `garment_cutout` or `hero_model`
- `title`

Optional elements:

- `detail_crop`
- `small_note`
- `sku_label`
- `palette_chip`

Best for:

- selected recommendation assets
- mixed fabric + garment storytelling

### 5. `comparison_board`

Use when comparing several options or grouped variants.

Required elements:

- 3-6 medium-priority visual assets
- `title`

Optional elements:

- short captions
- price or budget tags
- feature bullets

Best for:

- multiple candidate directions
- grouped option pages

### 6. `closing`

Use to end the deck.

Required elements:

- `title`
- `body`

Optional elements:

- contact block
- next-step note

## Standard element types

The generator should only reason about a limited element vocabulary:

- `logo`
- `hero_model`
- `mood_image`
- `garment_cutout`
- `fabric_swatch`
- `detail_crop`
- `palette_chip`
- `reference_patch`
- `sku_label`
- `supporting_image`
- `title`
- `subtitle`
- `body`
- `caption`
- `section_label`
- `small_note`
- `tagline`

This keeps generation stable.

## Layout decision rules

### When assets are image-heavy

Prefer:

- `inspiration_moodboard`
- `color_reference`
- `comparison_board`

### When assets are fabric-heavy

Prefer:

- `fabric_showcase`

### When text is important but assets are limited

Prefer:

- `left_text_right_image`
- `split_story`

### When only one strong hero asset exists

Prefer:

- `cover`
- `split_story`

### When assets are too few for a dense page

Do not force a collage. Drop density from `dense` to `medium` or `light`.

## Fallback rules

### Missing garment imagery

Render the slide as fabric-led:

- increase swatch area
- increase detail crops
- keep text short

### Missing fabric details

Render the slide as image-led:

- use garment cutouts or model shots
- keep palette chips visible

### Too many candidate assets

Split across multiple `comparison_board` or `fabric_showcase` slides.

### Very uneven image ratios

Bucket them before layout:

- portrait
- landscape
- square
- circular crop candidates

Never let raw asset ratios decide the whole slide.
