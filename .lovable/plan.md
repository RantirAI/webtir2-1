# Plan: Fix Background Elements Rendering in Canvas and Full Preview

## ✅ IMPLEMENTED

### Changes Made

1. **StyleSheetInjector.tsx**: Added stacking context CSS to BASE_CSS for `html, body`, `.root-style`, and `.builder-page`
2. **Canvas.tsx**: Added `position: relative` and `isolation: isolate` to the outer canvas wrapper
3. **CodeView.tsx**: Updated preview HTML to include `.builder-page` stacking context and `.wf-` class handling

All three rendering contexts (Canvas, Code View preview, Code View full preview) now consistently create stacking contexts to prevent z-index:-1 elements from disappearing.
