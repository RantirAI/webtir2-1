import JSZip from 'jszip';
import { ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';
import { useMediaStore } from '../store/useMediaStore';
import { parseHTMLToInstance } from './codeImport';
import { parseCSSToStyleStore } from './cssImport';

export interface ZipImportResult {
  pages: Array<{
    name: string;
    html: string;
    instance: ComponentInstance | null;
  }>;
  cssFiles: Array<{ name: string; content: string }>;
  jsFiles: Array<{ name: string; content: string }>;
  assets: Array<{ name: string; url: string; mimeType: string; size: number }>;
  summary: {
    totalFiles: number;
    htmlCount: number;
    cssCount: number;
    jsCount: number;
    assetCount: number;
    cssClassesCreated: number;
    cssPropertiesSet: number;
  };
}

// MIME types for common web assets
const imageMimeTypes: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.avif': 'image/avif',
};

const fontMimeTypes: Record<string, string> = {
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',
};

const videoMimeTypes: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
};

function getMimeType(filename: string): string {
  const ext = '.' + filename.split('.').pop()?.toLowerCase();
  return imageMimeTypes[ext] || fontMimeTypes[ext] || videoMimeTypes[ext] || 'application/octet-stream';
}

function isAssetFile(filename: string): boolean {
  const ext = '.' + filename.split('.').pop()?.toLowerCase();
  return !!(imageMimeTypes[ext] || fontMimeTypes[ext] || videoMimeTypes[ext]);
}

function isHTMLFile(filename: string): boolean {
  return /\.(html?|htm)$/i.test(filename);
}

function isCSSFile(filename: string): boolean {
  return /\.css$/i.test(filename);
}

function isJSFile(filename: string): boolean {
  return /\.(js|mjs)$/i.test(filename);
}

// Get a clean display name from a file path
function getDisplayName(filepath: string): string {
  const parts = filepath.split('/');
  const filename = parts[parts.length - 1];
  return filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Extract and process a ZIP file containing a website project.
 * 
 * - HTML files → parsed into ComponentInstances
 * - CSS files → applied to the style store
 * - JS files → stored for reference
 * - Images/fonts/videos → stored in Media Library
 * 
 * Asset URLs in HTML/CSS are rewritten to point to Data URL versions in the Media Library.
 */
export async function processZipFile(file: File): Promise<ZipImportResult> {
  const zip = await JSZip.loadAsync(file);
  
  // Collect all files by type
  const htmlFiles: Array<{ path: string; content: string }> = [];
  const cssFiles: Array<{ path: string; content: string }> = [];
  const jsFiles: Array<{ path: string; content: string }> = [];
  const assetFiles: Array<{ path: string; data: Uint8Array; mimeType: string }> = [];
  
  // Detect if ZIP has a single root folder (common pattern)
  const allPaths = Object.keys(zip.files).filter(p => !zip.files[p].dir);
  const rootPrefix = detectRootFolder(allPaths);

  // First pass: categorize all files
  for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
    if (zipEntry.dir) continue;
    
    // Strip common root folder prefix
    const cleanPath = rootPrefix ? relativePath.replace(rootPrefix, '') : relativePath;
    if (!cleanPath) continue;
    
    // Skip hidden files, OS files, and build artifacts
    if (shouldSkipFile(cleanPath)) continue;
    
    if (isHTMLFile(cleanPath)) {
      const content = await zipEntry.async('string');
      htmlFiles.push({ path: cleanPath, content });
    } else if (isCSSFile(cleanPath)) {
      const content = await zipEntry.async('string');
      cssFiles.push({ path: cleanPath, content });
    } else if (isJSFile(cleanPath)) {
      const content = await zipEntry.async('string');
      jsFiles.push({ path: cleanPath, content });
    } else if (isAssetFile(cleanPath)) {
      const data = await zipEntry.async('uint8array');
      assetFiles.push({ path: cleanPath, data, mimeType: getMimeType(cleanPath) });
    }
  }

  // Step 1: Process assets → create Data URLs and store in Media Library
  const assetUrlMap = new Map<string, string>(); // original path → data URL
  const storedAssets: ZipImportResult['assets'] = [];
  
  const { addFolder, addAsset } = useMediaStore.getState();
  
  // Create an "imports" folder for this ZIP
  const importFolderId = addFolder(`Import: ${file.name.replace('.zip', '')}`, null);
  
  for (const asset of assetFiles) {
    const blob = new Blob([asset.data], { type: asset.mimeType });
    const dataUrl = await blobToDataUrl(blob);
    const filename = asset.path.split('/').pop() || asset.path;
    
    // Store in media library
    addAsset({
      name: filename,
      type: asset.mimeType.startsWith('image/') ? 'image' : 
            asset.mimeType.startsWith('font/') ? 'font' : 
            asset.mimeType.startsWith('video/') ? 'video' : 'other',
      url: dataUrl,
      size: asset.data.length,
      mimeType: asset.mimeType,
      altText: '',
      folderId: importFolderId,
    });
    
    // Map all possible path references to this data URL
    // e.g. "images/logo.png", "./images/logo.png", "../images/logo.png", "/images/logo.png"
    const pathVariants = getPathVariants(asset.path);
    for (const variant of pathVariants) {
      assetUrlMap.set(variant, dataUrl);
    }
    
    storedAssets.push({
      name: filename,
      url: dataUrl,
      mimeType: asset.mimeType,
      size: asset.data.length,
    });
  }

  // Step 2: Process CSS files → rewrite asset URLs then apply to style store
  let totalClassesCreated = 0;
  let totalPropertiesSet = 0;
  const processedCss: ZipImportResult['cssFiles'] = [];
  
  for (const css of cssFiles) {
    // Rewrite asset URLs in CSS (url(...) references)
    const rewrittenCSS = rewriteUrlsInCSS(css.content, assetUrlMap);
    
    // Apply to style store
    const result = parseCSSToStyleStore(rewrittenCSS);
    totalClassesCreated += result.classesCreated;
    totalPropertiesSet += result.propertiesSet;
    
    processedCss.push({ name: css.path.split('/').pop() || css.path, content: rewrittenCSS });
  }

  // Step 3: Process HTML files → rewrite asset URLs then parse to instances
  const pages: ZipImportResult['pages'] = [];
  
  // Sort: index.html first
  htmlFiles.sort((a, b) => {
    if (a.path.toLowerCase().includes('index')) return -1;
    if (b.path.toLowerCase().includes('index')) return 1;
    return a.path.localeCompare(b.path);
  });
  
  for (const html of htmlFiles) {
    // Extract inline <style> blocks and process them
    const { cleanedHTML, extractedCSS } = extractInlineStyles(html.content);
    if (extractedCSS) {
      const rewrittenInlineCSS = rewriteUrlsInCSS(extractedCSS, assetUrlMap);
      const inlineResult = parseCSSToStyleStore(rewrittenInlineCSS);
      totalClassesCreated += inlineResult.classesCreated;
      totalPropertiesSet += inlineResult.propertiesSet;
    }
    
    // Extract <link> CSS references (already processed above, just note them)
    
    // Rewrite asset URLs in HTML (src, href attributes)
    const rewrittenHTML = rewriteUrlsInHTML(cleanedHTML, assetUrlMap);
    
    // Parse to component instance
    const instance = parseHTMLToInstance(rewrittenHTML);
    
    pages.push({
      name: getDisplayName(html.path),
      html: rewrittenHTML,
      instance,
    });
  }

  // Step 4: Process JS files
  const processedJs: ZipImportResult['jsFiles'] = jsFiles.map(js => ({
    name: js.path.split('/').pop() || js.path,
    content: js.content,
  }));

  return {
    pages,
    cssFiles: processedCss,
    jsFiles: processedJs,
    assets: storedAssets,
    summary: {
      totalFiles: allPaths.length,
      htmlCount: htmlFiles.length,
      cssCount: cssFiles.length,
      jsCount: jsFiles.length,
      assetCount: assetFiles.length,
      cssClassesCreated: totalClassesCreated,
      cssPropertiesSet: totalPropertiesSet,
    },
  };
}

// --- Helper functions ---

function detectRootFolder(paths: string[]): string {
  if (paths.length === 0) return '';
  
  // Check if all files share a common root folder
  const firstParts = paths[0].split('/');
  if (firstParts.length < 2) return '';
  
  const candidate = firstParts[0] + '/';
  const allMatch = paths.every(p => p.startsWith(candidate));
  return allMatch ? candidate : '';
}

function shouldSkipFile(path: string): boolean {
  const lower = path.toLowerCase();
  return (
    lower.startsWith('.') ||
    lower.startsWith('__macosx') ||
    lower.includes('/.') ||
    lower.includes('node_modules/') ||
    lower.includes('.ds_store') ||
    lower.includes('thumbs.db') ||
    lower === 'license' ||
    lower === 'readme.md'
  );
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function getPathVariants(path: string): string[] {
  const filename = path.split('/').pop() || path;
  const variants = [
    path,
    './' + path,
    '/' + path,
    '../' + path,
    filename,
    './' + filename,
  ];
  
  // Also add without leading folder segments (e.g. "css/style.css" → "style.css")
  const parts = path.split('/');
  for (let i = 1; i < parts.length; i++) {
    variants.push(parts.slice(i).join('/'));
  }
  
  return [...new Set(variants)];
}

function rewriteUrlsInCSS(css: string, urlMap: Map<string, string>): string {
  // Match url(...) references
  return css.replace(/url\(\s*['"]?([^'")\s]+)['"]?\s*\)/g, (match, url) => {
    // Skip data URLs and absolute HTTP URLs
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
      return match;
    }
    
    // Try to find a matching asset
    const cleanUrl = url.replace(/^\.\//, '').replace(/^\//, '').replace(/\.\.\//g, '');
    for (const [key, dataUrl] of urlMap) {
      if (key === url || key === cleanUrl || key.endsWith('/' + cleanUrl) || key === url.split('/').pop()) {
        return `url("${dataUrl}")`;
      }
    }
    
    return match;
  });
}

function rewriteUrlsInHTML(html: string, urlMap: Map<string, string>): string {
  // Rewrite src and href attributes pointing to local assets
  return html.replace(/(src|href)=["']([^"']+)["']/g, (match, attr, url) => {
    // Skip anchors, data URLs, external URLs, and CSS/JS links
    if (url.startsWith('#') || url.startsWith('data:') || 
        url.startsWith('http://') || url.startsWith('https://') ||
        url.startsWith('mailto:') || url.startsWith('tel:')) {
      return match;
    }
    
    // Skip CSS and JS file references (they're processed separately)
    if (isCSSFile(url) || isJSFile(url)) {
      return match;
    }
    
    const cleanUrl = url.replace(/^\.\//, '').replace(/^\//, '').replace(/\.\.\//g, '');
    for (const [key, dataUrl] of urlMap) {
      if (key === url || key === cleanUrl || key.endsWith('/' + cleanUrl) || key === url.split('/').pop()) {
        return `${attr}="${dataUrl}"`;
      }
    }
    
    return match;
  });
}

function extractInlineStyles(html: string): { cleanedHTML: string; extractedCSS: string } {
  let extractedCSS = '';
  
  // Extract <style> blocks
  const cleanedHTML = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, cssContent) => {
    extractedCSS += cssContent + '\n';
    return '';
  });
  
  return { cleanedHTML, extractedCSS };
}
