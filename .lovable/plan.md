
## Goal
Make imported decorative “background” elements (dots, waves, shapes) render persistently (no flash-then-disappear) in:
- Canvas
- Canvas Preview
- Code View preview (right-side iframe)
- Full Page Preview

Assets are already being downloaded successfully; this plan focuses on fixing why those background decorations become invisible after initial render.

---

## Working hypothesis (based on symptoms)
The behavior “looks correct for a split second, then disappears” strongly suggests a **second render/style pass** overrides the initial correct paint.

The most likely culprits (not mutually exclusive):

1) **Negative z-index decorations + missing stacking context at the correct ancestor**
   - Even though we added `isolation: isolate` on `body` (iframe) and `.builder-page`, the *actual parent* of the `z-index:-1` elements might still not create a stable stacking context, or the elements are using `position: fixed` / odd positioning that escapes the expected context.
   - Result: backgrounds initially paint, then end up behind an ancestor/background and vanish.

2) **CSS background-image becomes invalid after URL rewriting (Data URL edge case)**
   - Backgrounds are more sensitive than `<img>` because `background-image: url(...)` parsing can break if the URL isn’t quoted or contains characters that CSS treats specially.
   - Result: backgrounds paint briefly (old URL / old CSS), then disappear when rewritten CSS is applied.

3) **Our “backgroundColor as overlay” logic can unintentionally cover imported backgrounds**
   - If an imported class has `backgroundColor` plus `backgroundImage/Gradient`, and we treat color as a top overlay layer, an opaque color (like white) will hide the imported background visuals.
   - Result: correct background appears during one render pass, then disappears once the store/CSS recomputation applies the overlay behavior.

This plan addresses all three in a safe, incremental order.

---

## Phase 1 — Add targeted diagnostics (so we stop guessing)
### 1. Add a “Background Debug” mode (temporary but very useful)
When enabled:
- In **Canvas**, run a post-render inspection that:
  - Finds elements with computed `z-index < 0`
  - Logs: tag, class list, computed z-index, computed position, and the closest ancestor that has `isolation`, `transform`, or a non-auto z-index.
  - Optionally adds a visible outline so we can confirm the elements exist but are hidden.

- In **CodeView Preview iframe**, inject a small script that runs after DOM is written:
  - Same scan/logging for `z-index < 0`
  - Logs any element whose `background-image` computed style becomes `none` after a short delay (e.g., check at 0ms, 250ms, 1000ms)

**Files involved**
- `src/builder/components/Canvas.tsx` (add debug hook)
- `src/builder/components/CodeView.tsx` (inject debug script into previewHTML when debug mode enabled)

**Outcome**
We’ll know whether:
- Elements are present but behind something (stacking context issue), or
- The `background-image` rule becomes invalid/none (rewrite/parsing issue), or
- The class styles change after initial paint (store regeneration/overlay issue)

---

## Phase 2 — Make stacking contexts robust where it matters (not just body)
### 2.1 Ensure stacking context on the *actual page root container*
Right now we isolate `.builder-page` (canvas wrapper) and `body` (iframe). If the imported structure relies on a specific wrapper like `.root-style` (seen in your screenshot), we should enforce stacking context there too.

Add generated CSS rules (via style store defaults or BASE_CSS) so that:
- `.root-style` always has:
  - `position: relative;`
  - `isolation: isolate;`
- Additionally in preview HTML:
  - `html, body { position: relative; isolation: isolate; }`

**Files involved**
- `src/builder/utils/initStyles.ts` (ensure `root-style` gets position/isolation defaults)
- `src/builder/components/CodeView.tsx` (apply `html, body` rules in preview template)
- `src/builder/utils/export.ts` (add same `html` rule to exported stylesheet)

**Why this helps**
Most Webflow “decorative background” patterns are implemented as absolutely-positioned elements inside a wrapper with `z-index:-1`. Those elements need a reliable stacking context on the wrapper they’re intended to sit behind.

---

## Phase 3 — Fix Data URL background parsing (very common gotcha)
### 3.1 Always quote Data URLs inside `url(...)`
Update the URL rewriting so CSS becomes:
- `background-image: url("data:image/...")`
instead of:
- `background-image: url(data:image/...)`

Also ensure replacements handle multiple-layer background-image strings safely.

**Files involved**
- `src/builder/utils/urlRewriter.ts`
  - Change replacement so `newUrl` is injected as `"${dataUrl}"` (quoted)
  - Ensure we replace all instances across comma-separated background layers

**Why this helps**
This is a classic reason why `<img src="data:...">` works fine but `background-image: url(data:...)` silently fails.

---

## Phase 4 — Prevent imported backgrounds from being “covered” by overlay logic
### 4.1 Make backgroundColor overlay behavior conditional for imports
Current behavior can treat `backgroundColor` as a top overlay layer when any background image/gradient exists. That’s not how Webflow CSS behaves (Webflow uses standard CSS: background-color sits behind background-image).

We will adjust the layering logic so that:
- For **imported Webflow style sources**, keep `background-color` as `background-color` (bottom), and only stack gradient/image into `background-image`.
- Only use “color-as-overlay” behavior when we explicitly know the user intended an overlay (e.g., via metadata set by our own style UI).

**Implementation approach**
- Tag styleSources created by Webflow import with metadata: `{ importedFrom: 'webflow' }`
- Update `combineBackgroundLayers(...)` to accept the current styleSource (or a flag) so it can choose the correct semantics.

**Files involved**
- `src/builder/utils/webflowTranslator.ts` (set metadata on created style sources)
- `src/builder/components/StyleSheetInjector.tsx` (call `combineBackgroundLayers(baseProps, source)` and apply “webflow semantics” when appropriate)
- `src/builder/utils/export.ts` (same adjustment for export)

**Risk management**
- Existing non-imported projects that may rely on “color overlay” behavior remain unchanged.
- Only imported Webflow classes get “standard CSS” behavior.

---

## Phase 5 — Verification checklist (what you should see after)
1) Import the same Webflow design again.
2) Canvas:
   - decorative background elements remain visible (no flicker)
3) Code View preview panel:
   - decorative background elements remain visible
4) Full preview:
   - decorative background remains visible permanently (no disappearing after seconds)
5) Confirm data URLs appear quoted in exported CSS for background-image rules.

---

## Scope of code changes (summary)
### Modify
- `src/builder/components/Canvas.tsx`
- `src/builder/components/CodeView.tsx`
- `src/builder/utils/initStyles.ts`
- `src/builder/utils/urlRewriter.ts`
- `src/builder/utils/webflowTranslator.ts`
- `src/builder/components/StyleSheetInjector.tsx`
- `src/builder/utils/export.ts`

### Optional new helper (if we want clean code)
- `src/builder/utils/backgroundDebug.ts` (debug-only utilities)
- `src/builder/utils/stackingContextFixer.ts` (if we decide to add a post-import normalization pass)

---

## If you want to proceed
You can tell me to continue in a new request, and I’ll implement this in Default mode in the order above (Diagnostics → Root stacking context → Data URL quoting → Webflow overlay semantics). This sequencing minimizes risk and ensures we fix the real cause rather than masking symptoms.
