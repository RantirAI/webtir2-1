/**
 * URL Rewriter Utility
 * Rewrites external URLs in component trees and styles to use downloaded local assets
 */

import { ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';
import { DownloadedAsset, isExternalUrl } from './assetDownloader';

/**
 * Recursively collect all style source IDs from a component instance tree
 */
export function collectStyleSourceIds(instance: ComponentInstance): string[] {
  const ids: string[] = [];
  
  if (instance.styleSourceIds) {
    ids.push(...instance.styleSourceIds);
  }
  
  if (instance.children) {
    for (const child of instance.children) {
      ids.push(...collectStyleSourceIds(child));
    }
  }
  
  return [...new Set(ids)]; // Remove duplicates
}

/**
 * Rewrite URLs in a component instance tree
 * Returns a new instance with rewritten URLs
 */
export function rewriteInstanceUrls(
  instance: ComponentInstance,
  urlMapping: Map<string, DownloadedAsset>
): ComponentInstance {
  const rewritten = { ...instance };
  
  // Rewrite image src
  if (instance.type === 'Image' && instance.props?.src) {
    const src = instance.props.src;
    if (isExternalUrl(src)) {
      const mapping = urlMapping.get(src);
      if (mapping) {
        rewritten.props = { ...rewritten.props, src: mapping.dataUrl };
      }
    }
  }
  
  // Rewrite video src
  if (instance.type === 'Video' && instance.props?.src) {
    const src = instance.props.src;
    if (isExternalUrl(src)) {
      const mapping = urlMapping.get(src);
      if (mapping) {
        rewritten.props = { ...rewritten.props, src: mapping.dataUrl };
      }
    }
  }
  
  // Recursively process children
  if (instance.children && instance.children.length > 0) {
    rewritten.children = instance.children.map(child =>
      rewriteInstanceUrls(child, urlMapping)
    );
  }
  
  return rewritten;
}

/**
 * Extract URL from CSS url() function
 */
function extractUrlFromCss(value: string): string | null {
  const match = value.match(/url\(['"]?([^'")\s]+)['"]?\)/);
  return match ? match[1] : null;
}

/**
 * Replace URL in CSS url() function
 */
function replaceUrlInCss(value: string, oldUrl: string, newUrl: string): string {
  // Handle various url() formats
  return value
    .replace(`url(${oldUrl})`, `url(${newUrl})`)
    .replace(`url("${oldUrl}")`, `url("${newUrl}")`)
    .replace(`url('${oldUrl}')`, `url('${newUrl}')`);
}

/**
 * Rewrite URLs in styles (background-image, etc.) for the given style sources
 */
export function rewriteStyleUrls(
  styleSourceIds: string[],
  urlMapping: Map<string, DownloadedAsset>
): void {
  if (styleSourceIds.length === 0 || urlMapping.size === 0) return;
  
  const { styles, batchSetStyles } = useStyleStore.getState();
  const updates: Array<{
    styleSourceId: string;
    property: string;
    value: string;
    breakpointId: string;
    state: string;
  }> = [];
  
  // Find all background-related properties that might contain URLs
  const backgroundProperties = ['backgroundImage', 'background-image'];
  
  Object.entries(styles).forEach(([key, value]) => {
    if (!value || typeof value !== 'string') return;
    
    // Check if this is a background property
    const hasBackgroundProp = backgroundProperties.some(prop => key.includes(`:${prop}`));
    if (!hasBackgroundProp) return;
    
    // Parse the key format: sourceId:breakpoint:state:property
    const parts = key.split(':');
    if (parts.length !== 4) return;
    
    const [sourceId, breakpoint, state, property] = parts;
    
    // Check if this style source is in our list
    if (!styleSourceIds.includes(sourceId)) return;
    
    // Check if value contains url()
    if (!value.includes('url(')) return;
    
    // Try to find and replace URLs
    let newValue = value;
    let hasReplacement = false;
    
    urlMapping.forEach((downloaded, originalUrl) => {
      if (value.includes(originalUrl)) {
        newValue = replaceUrlInCss(newValue, originalUrl, downloaded.dataUrl);
        hasReplacement = true;
      }
    });
    
    if (hasReplacement) {
      updates.push({
        styleSourceId: sourceId,
        property,
        value: newValue,
        breakpointId: breakpoint,
        state,
      });
    }
  });
  
  // Batch apply style updates
  if (updates.length > 0) {
    console.log(`[URL Rewriter] Rewriting ${updates.length} style URLs`);
    batchSetStyles(updates as any);
  }
}

/**
 * Rewrite all URLs in an instance tree and its associated styles
 */
export function rewriteAllUrls(
  instance: ComponentInstance,
  urlMapping: Map<string, DownloadedAsset>
): ComponentInstance {
  // First rewrite instance props
  const rewrittenInstance = rewriteInstanceUrls(instance, urlMapping);
  
  // Then rewrite style URLs
  const styleSourceIds = collectStyleSourceIds(rewrittenInstance);
  rewriteStyleUrls(styleSourceIds, urlMapping);
  
  return rewrittenInstance;
}
