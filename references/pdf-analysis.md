# PDF analysis guidance

## Goal

Turn a trend PDF into a material-oriented brief that can drive clarification, image generation, and PPT export.

## Preferred mode

If the runtime model already supports PDF understanding, pass the PDF directly to the model and ask it to output the material brief fields below.

Do not add separate OCR or PDF parsing complexity unless the runtime cannot already see the PDF.

## Required output fields

- `theme`
- `audience`
- `useCases`
- `materialDirection`
- `colorPalette`
- `textureAndFinish`
- `performance`
- `styleKeywords`
- `constraints`
- `exclusions`
- `budget`
- `summary`
- `ambiguities`
- `missingInfo`

## Prompting guidance

When analyzing a PDF, instruct the model to:

- focus on fabric direction rather than generic fashion commentary
- summarize only what affects material choice
- separate explicit statements from inferred trends
- keep ambiguities explicit so follow-up questions can be asked
- produce short, practical, Chinese-language field values

## Fallback mode

If the runtime cannot inspect the PDF directly, the local CLI extracts text and runs the same brief-normalization flow over the extracted text.
