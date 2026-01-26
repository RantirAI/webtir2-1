
# Plan: Fix Background Disappearing + Auto-Download Assets on Import

## Executive Summary

This plan addresses two related issues:
1. **Background elements appear briefly then disappear** in Canvas and Code View previews
2. **External assets not downloaded** during Webflow/Figma imports (images remain hosted on CDNs)

The solution involves fixing the background rendering pipeline and adding automatic asset downloading during imports with URL rewriting.

---

## Part 1: Fix Background Disappearing Issue

### Root Cause Analysis

The backgrounds flash and disappear because:

1. **Style Injection Timing**: The `StyleSheetInjector` properly generates CSS, but when the component re-renders, the styles may not be applied in time
2. **combineBackgroundLayers Edge Case**: The function handles `(color + gradient/image)` and `(gradient-only)`, but NOT `(image-only)` case
3. **Missing background-gradient cleanup**: When only `background-image` is present (no gradient, no color), the intermediate `background-gradient` property may linger and cause conflicts

### The Missing Case in combineBackgroundLayers

Current logic:
```text
if (bgColor && (bgImage || bgGradient)) → combine layers ✅
else if (bgGradient && !bgColor) → use gradient as background-image ✅
else → NO HANDLING for image-only case! ❌
```

The image-only case (`bgImage` without `bgColor` or `bgGradient`) passes through unchanged, BUT the `background-gradient` property isn't cleaned up and may conflict.

### Fix Required

**File: `src/builder/components/StyleSheetInjector.tsx`**
**File: `src/builder/utils/export.ts`**

Update `combineBackgroundLayers` to handle all cases:
1. Color + media → combine into layers (existing)
2. Gradient-only → move to background-image (existing)
3. **Image-only → ensure background-image is set, clean up any stray background-gradient**
4. **Handle image + gradient without color** (combine them)

---

## Part 2: Auto-Download Assets on Import

### Current State

- `extractWebflowAssets()` extracts asset URLs from Webflow JSON
- Assets remain as external CDN URLs (e.g., `https://uploads-ssl.webflow.com/...`)
- No download or local storage happens
- Image elements and CSS backgrounds reference external URLs

### Target State

1. During Webflow/Figma import, automatically download all referenced assets
2. Store downloaded assets in the Media Library (`useMediaStore`)
3. Rewrite URLs in the imported component tree to use local Data URLs
4. Assets appear under `/media` in CodeView file tree

### Implementation Approach

Since this runs entirely in the browser (no backend/server), we'll:
1. Use `fetch()` to download assets as blobs
2. Convert blobs to Data URLs using `FileReader`
3. Add to `useMediaStore`
4. Rewrite URLs in the component tree before adding to canvas

---

## Technical Implementation

### Step 1: Create Asset Download Utility

**New File: `src/builder/utils/assetDownloader.ts`**

```typescript
// Downloads external assets and returns a URL mapping
export async function downloadAssets(
  assets: Array<{ url: string; alt: string; name: string }>
): Promise<Map<string, { dataUrl: string; assetId: string }>> {
  const urlMapping = new Map();
  
  for (const asset of assets) {
    try {
      // Fetch the asset
      const response = await fetch(asset.url, { mode: 'cors' });
      const blob = await response.blob();
      
      // Convert to Data URL
      const dataUrl = await blobToDataUrl(blob);
      
      // Add to media store
      const assetId = useMediaStore.getState().addAsset({
        name: asset.name,
        type: 'other', // Auto-detected by store
        url: dataUrl,
        size: blob.size,
        mimeType: blob.type,
        altText: asset.alt,
        folderId: getOrCreateImportFolder(), // Place in "imports" folder
      });
      
      urlMapping.set(asset.url, { dataUrl, assetId });
    } catch (error) {
      console.warn(`Failed to download asset: ${asset.url}`, error);
      // Keep original URL as fallback
    }
  }
  
  return urlMapping;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function getOrCreateImportFolder(): string | null {
  const { folders, addFolder } = useMediaStore.getState();
  const importFolder = Object.values(folders).find(f => f.name === 'imports');
  if (importFolder) return importFolder.id;
  return addFolder('imports', null);
}
```

### Step 2: Create URL Rewriting Utility

**New File: `src/builder/utils/urlRewriter.ts`**

```typescript
// Rewrites URLs in component tree
export function rewriteInstanceUrls(
  instance: ComponentInstance,
  urlMapping: Map<string, { dataUrl: string; assetId: string }>
): ComponentInstance {
  const rewritten = { ...instance };
  
  // Rewrite image src
  if (instance.type === 'Image' && instance.props?.src) {
    const mapping = urlMapping.get(instance.props.src);
    if (mapping) {
      rewritten.props = { ...rewritten.props, src: mapping.dataUrl };
    }
  }
  
  // Recursively process children
  if (instance.children?.length) {
    rewritten.children = instance.children.map(child =>
      rewriteInstanceUrls(child, urlMapping)
    );
  }
  
  return rewritten;
}

// Rewrites URLs in styles (background-image)
export function rewriteStyleUrls(
  styleSourceIds: string[],
  urlMapping: Map<string, { dataUrl: string; assetId: string }>
): void {
  const { styles, setStyle } = useStyleStore.getState();
  
  // Find all backgroundImage properties for these style sources
  Object.entries(styles).forEach(([key, value]) => {
    if (key.includes(':backgroundImage') && value) {
      // Extract URL from url(...) pattern
      const urlMatch = value.match(/url\(['"]?([^'")\s]+)['"]?\)/);
      if (urlMatch && urlMapping.has(urlMatch[1])) {
        const mapping = urlMapping.get(urlMatch[1])!;
        const [sourceId, breakpoint, state] = key.split(':');
        if (styleSourceIds.includes(sourceId)) {
          setStyle(sourceId, 'backgroundImage', `url(${mapping.dataUrl})`, breakpoint, state);
        }
      }
    }
  });
}
```

### Step 3: Integrate into Import Flow

**File: `src/builder/components/ImportModal.tsx`**

Update the Webflow import handler:

```typescript
// After line 156: const instance = translateWebflowToWebtir(wfData);
if (instance) {
  // Extract and download assets
  const assets = extractWebflowAssets(wfData);
  const urlMapping = await downloadAssets(assets);
  
  // Rewrite URLs in instance tree
  const rewrittenInstance = rewriteInstanceUrls(instance, urlMapping);
  
  // Rewrite URLs in styles (for background-images)
  const allStyleIds = collectStyleSourceIds(rewrittenInstance);
  rewriteStyleUrls(allStyleIds, urlMapping);
  
  addInstance(rewrittenInstance, rootInstance.id);
  
  toast({
    title: 'Webflow Import Success',
    description: `Imported ${convertPreview?.nodes || 0} components. Downloaded ${urlMapping.size} assets.`,
  });
  // ...
}
```

### Step 4: Fix combineBackgroundLayers

**File: `src/builder/components/StyleSheetInjector.tsx`** (lines 21-61)
**File: `src/builder/utils/export.ts`** (lines 66-100)

```typescript
function combineBackgroundLayers(props: Record<string, string>): Record<string, string> {
  const result = { ...props };
  
  const bgColor = props['background-color'];
  const bgImage = props['background-image'];
  const bgGradient = props['background-gradient'];
  
  // Case 1: Color + media (gradient and/or image)
  if (bgColor && bgColor !== 'transparent' && (bgImage || bgGradient)) {
    const colorOverlay = `linear-gradient(${bgColor}, ${bgColor})`;
    const layers: string[] = [colorOverlay];
    if (bgGradient) layers.push(bgGradient);
    if (bgImage) layers.push(bgImage);
    
    result['background-image'] = layers.join(', ');
    delete result['background-color'];
    delete result['background-gradient'];
    
    // Scale size/position/repeat to layer count
    const layerCount = layers.length;
    const existingSize = props['background-size'] || 'cover';
    const existingPosition = props['background-position'] || 'center';
    const existingRepeat = props['background-repeat'] || 'no-repeat';
    result['background-size'] = Array(layerCount).fill(existingSize).join(', ');
    result['background-position'] = Array(layerCount).fill(existingPosition).join(', ');
    result['background-repeat'] = Array(layerCount).fill(existingRepeat).join(', ');
  }
  // Case 2: Gradient + Image (no color overlay needed)
  else if (bgGradient && bgImage) {
    result['background-image'] = `${bgGradient}, ${bgImage}`;
    delete result['background-gradient'];
    
    const existingSize = props['background-size'] || 'cover';
    const existingPosition = props['background-position'] || 'center';
    const existingRepeat = props['background-repeat'] || 'no-repeat';
    result['background-size'] = `${existingSize}, ${existingSize}`;
    result['background-position'] = `${existingPosition}, ${existingPosition}`;
    result['background-repeat'] = `${existingRepeat}, ${existingRepeat}`;
  }
  // Case 3: Gradient only (no image, no color)
  else if (bgGradient && !bgImage) {
    result['background-image'] = bgGradient;
    delete result['background-gradient'];
  }
  // Case 4: Image only - just clean up stray gradient property if present
  else if (bgImage) {
    // Ensure background-gradient doesn't interfere
    delete result['background-gradient'];
  }
  
  return result;
}
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/builder/utils/assetDownloader.ts` | **Create** | Download external assets to Media Library |
| `src/builder/utils/urlRewriter.ts` | **Create** | Rewrite URLs in component tree and styles |
| `src/builder/components/ImportModal.tsx` | **Modify** | Integrate asset download + URL rewriting |
| `src/builder/components/StyleSheetInjector.tsx` | **Modify** | Fix combineBackgroundLayers for all cases |
| `src/builder/utils/export.ts` | **Modify** | Fix combineBackgroundLayers for all cases |
| `src/builder/utils/webflowTranslator.ts` | **Modify** | Export collectStyleSourceIds helper |

---

## Edge Cases Handled

1. **CORS failures**: If an asset can't be downloaded (CORS blocked), keep the original URL
2. **Large assets**: Data URLs work for reasonable file sizes; very large assets may need warning
3. **Duplicate assets**: Assets used multiple times share the same downloaded copy
4. **Mixed URL patterns**: Handle both `url(...)` and bare URLs in different contexts
5. **Nested folders**: Downloaded assets go into an "imports" folder for organization

---

## Testing Checklist

- [ ] Import Webflow design with background patterns → backgrounds persist in Canvas
- [ ] Import Webflow design → assets appear in /media folder
- [ ] Image src URLs are rewritten to Data URLs
- [ ] CSS background-image URLs are rewritten
- [ ] Preview mode shows backgrounds correctly
- [ ] Code View preview shows backgrounds correctly
- [ ] Gradient-only backgrounds work
- [ ] Image-only backgrounds work
- [ ] Combined color + gradient + image backgrounds work
- [ ] CORS-blocked assets fall back gracefully
