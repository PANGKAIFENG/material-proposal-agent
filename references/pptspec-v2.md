# PPTSpec v2

`PPTSpec` is the contract between analysis/planning and rendering.

The planner should not emit pixel coordinates. It should emit semantic structure.

## Root structure

```json
{
  "title": "2026 秋冬面料提案",
  "subject": "Material proposal",
  "slides": []
}
```

## Slide structure

```json
{
  "slideType": "fabric_showcase",
  "title": "What do we have",
  "subtitle": "Soft brushed recycled knit",
  "layoutIntent": {
    "visualFocus": "fabric_texture",
    "density": "medium",
    "composition": "split_story"
  },
  "assets": [],
  "textBlocks": [],
  "notes": {}
}
```

## `slideType`

Allowed values:

- `cover`
- `inspiration_moodboard`
- `color_reference`
- `fabric_showcase`
- `comparison_board`
- `summary`
- `candidate`
- `closing`

## `layoutIntent`

This tells the renderer how the slide should feel.

### `visualFocus`

- `hero_story`
- `fabric_texture`
- `color_story`
- `product_mix`

### `density`

- `light`
- `medium`
- `dense`

### `composition`

- `centered_cover`
- `left_text_right_image`
- `collage_with_copy`
- `split_story`
- `grid_showcase`
- `banded_color_story`

## `assets`

Each asset must include:

- `id`
- `type`
- `path`

Optional:

- `caption`
- `priority`
- `aspectRatio`
- `tags`

### Asset types

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

## `textBlocks`

Each text block must include:

- `role`
- `content`

Optional:

- `emphasis`

### Roles

- `title`
- `subtitle`
- `body`
- `caption`
- `section_label`
- `small_note`
- `tagline`

## `notes`

`notes` is a free-form bridge for renderers that still depend on placeholder tags or template field names.

This is useful while the system is transitioning from template-driven to rule-driven generation.
