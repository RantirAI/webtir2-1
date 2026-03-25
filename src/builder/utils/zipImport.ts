import JSZip, { JSZipObject } from 'jszip';
import { ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';
import { useMediaStore } from '../store/useMediaStore';
import { parseHTMLToInstance } from './codeImport';

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

const IMPORT_LIMITS = {
  maxFiles: 2000,
  maxAssets: 250,
  maxAssetBytesPerFile: 5 * 1024 * 1024,
  maxAssetBytesTotal: 30 * 1024 * 1024,
  maxCssBytes: 1_500_000,
  maxJsBytesPerFile: 500_000,
};

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

function getDisplayName(filepath: string): string {
  const parts = filepath.split('/');
  const filename = parts[parts.length - 1];
  return filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const yieldToMainThread = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

export async function processZipFile(file: File): Promise<ZipImportResult> {
  const zip = await JSZip.loadAsync(file);

  const allPaths = Object.keys(zip.files).filter((p) => !zip.files[p].dir);
  if (allPaths.length > IMPORT_LIMITS.maxFiles) {
    throw new Error(`ZIP has too many files (${allPaths.length}). Limit is ${IMPORT_LIMITS.maxFiles}.`);
  }

  const rootPrefix = detectRootFolder(allPaths);

  const htmlEntries: Array<{ path: string; entry: JSZipObject }> = [];
  const cssEntries: Array<{ path: string; entry: JSZipObject }> = [];
  const jsEntries: Array<{ path: string; entry: JSZipObject }> = [];
  const assetEntries: Array<{ path: string; entry: JSZipObject; mimeType: string }> = [];

  for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
    if (zipEntry.dir) continue;

    const cleanPath = rootPrefix ? relativePath.replace(rootPrefix, '') : relativePath;
    if (!cleanPath || shouldSkipFile(cleanPath)) continue;

    if (isHTMLFile(cleanPath)) {
      htmlEntries.push({ path: cleanPath, entry: zipEntry });
    } else if (isCSSFile(cleanPath)) {
      cssEntries.push({ path: cleanPath, entry: zipEntry });
    } else if (isJSFile(cleanPath)) {
      jsEntries.push({ path: cleanPath, entry: zipEntry });
    } else if (isAssetFile(cleanPath)) {
      assetEntries.push({ path: cleanPath, entry: zipEntry, mimeType: getMimeType(cleanPath) });
    }
  }

  const { addFolder, addAsset } = useMediaStore.getState();
  const assetUrlMap = new Map<string, string>();
  const storedAssets: ZipImportResult['assets'] = [];
  const importFolderId = addFolder(`Import: ${file.name.replace('.zip', '')}`, null);

  let totalAssetBytes = 0;
  for (let i = 0; i < assetEntries.length && i < IMPORT_LIMITS.maxAssets; i++) {
    const asset = assetEntries[i];
    const buffer = await asset.entry.async('arraybuffer');
    const size = buffer.byteLength;

    if (size > IMPORT_LIMITS.maxAssetBytesPerFile) continue;
    if (totalAssetBytes + size > IMPORT_LIMITS.maxAssetBytesTotal) break;

    const blob = new Blob([buffer], { type: asset.mimeType });
    const objectUrl = URL.createObjectURL(blob);
    const filename = asset.path.split('/').pop() || asset.path;

    addAsset({
      name: filename,
      type: asset.mimeType.startsWith('image/')
        ? 'image'
        : asset.mimeType.startsWith('font/')
          ? 'font'
          : asset.mimeType.startsWith('video/')
            ? 'video'
            : 'other',
      url: objectUrl,
      size,
      mimeType: asset.mimeType,
      altText: '',
      folderId: importFolderId,
    });

    totalAssetBytes += size;

    const pathVariants = getPathVariants(asset.path);
    for (const variant of pathVariants) {
      assetUrlMap.set(variant, objectUrl);
    }

    storedAssets.push({
      name: filename,
      url: objectUrl,
      mimeType: asset.mimeType,
      size,
    });

    if (i % 15 === 0) await yieldToMainThread();
  }

  const processedCss: ZipImportResult['cssFiles'] = [];
  const cssChunks: string[] = [];
  let cssBytes = 0;

  for (let i = 0; i < cssEntries.length; i++) {
    const css = cssEntries[i];
    const cssText = await css.entry.async('string');
    const rewrittenCSS = rewriteUrlsInCSS(cssText, assetUrlMap);
    const cssLength = rewrittenCSS.length;

    processedCss.push({ name: css.path.split('/').pop() || css.path, content: rewrittenCSS });

    if (cssBytes < IMPORT_LIMITS.maxCssBytes) {
      const allowed = Math.max(0, IMPORT_LIMITS.maxCssBytes - cssBytes);
      cssChunks.push(rewrittenCSS.slice(0, allowed));
      cssBytes += Math.min(cssLength, allowed);
    }

    if (i % 5 === 0) await yieldToMainThread();
  }

  const pages: ZipImportResult['pages'] = [];
  htmlEntries.sort((a, b) => {
    if (a.path.toLowerCase().includes('index')) return -1;
    if (b.path.toLowerCase().includes('index')) return 1;
    return a.path.localeCompare(b.path);
  });

  for (let i = 0; i < htmlEntries.length; i++) {
    const htmlEntry = htmlEntries[i];
    const htmlText = await htmlEntry.entry.async('string');

    const { cleanedHTML, extractedCSS } = extractInlineStyles(htmlText);
    if (extractedCSS && cssBytes < IMPORT_LIMITS.maxCssBytes) {
      const rewrittenInlineCSS = rewriteUrlsInCSS(extractedCSS, assetUrlMap);
      const allowed = Math.max(0, IMPORT_LIMITS.maxCssBytes - cssBytes);
      cssChunks.push(rewrittenInlineCSS.slice(0, allowed));
      cssBytes += Math.min(rewrittenInlineCSS.length, allowed);
    }

    const rewrittenHTML = rewriteUrlsInHTML(cleanedHTML, assetUrlMap);
    const instance = i === 0 ? parseHTMLToInstance(rewrittenHTML) : null;

    pages.push({
      name: getDisplayName(htmlEntry.path),
      html: rewrittenHTML,
      instance,
    });

    if (i % 3 === 0) await yieldToMainThread();
  }

  const jsFiles: ZipImportResult['jsFiles'] = [];
  for (let i = 0; i < jsEntries.length; i++) {
    const js = jsEntries[i];
    const jsContent = await js.entry.async('string');
    jsFiles.push({
      name: js.path.split('/').pop() || js.path,
      content: jsContent.slice(0, IMPORT_LIMITS.maxJsBytesPerFile),
    });

    if (i % 10 === 0) await yieldToMainThread();
  }

  const mergedCss = cssChunks.filter(Boolean).join('\n\n');
  if (mergedCss.trim()) {
    const { rawCssOverrides, setRawCssOverrides } = useStyleStore.getState();
    const nextCss = [rawCssOverrides, '/* ZIP Import */', mergedCss].filter(Boolean).join('\n\n');
    setRawCssOverrides(nextCss);
  }

  return {
    pages,
    cssFiles: processedCss,
    jsFiles,
    assets: storedAssets,
    summary: {
      totalFiles: allPaths.length,
      htmlCount: htmlEntries.length,
      cssCount: cssEntries.length,
      jsCount: jsEntries.length,
      assetCount: storedAssets.length,
      cssClassesCreated: 0,
      cssPropertiesSet: 0,
    },
  };
}

function detectRootFolder(paths: string[]): string {
  if (paths.length === 0) return '';

  const firstParts = paths[0].split('/');
  if (firstParts.length < 2) return '';

  const candidate = firstParts[0] + '/';
  const allMatch = paths.every((p) => p.startsWith(candidate));
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

  const parts = path.split('/');
  for (let i = 1; i < parts.length; i++) {
    variants.push(parts.slice(i).join('/'));
  }

  return [...new Set(variants)];
}

function rewriteUrlsInCSS(css: string, urlMap: Map<string, string>): string {
  return css.replace(/url\(\s*['"]?([^'")\s]+)['"]?\s*\)/g, (match, url) => {
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
      return match;
    }

    const cleanUrl = url.replace(/^\.\//, '').replace(/^\//, '').replace(/\.\.\//g, '');
    for (const [key, resolvedUrl] of urlMap) {
      if (key === url || key === cleanUrl || key.endsWith('/' + cleanUrl) || key === url.split('/').pop()) {
        return `url("${resolvedUrl}")`;
      }
    }

    return match;
  });
}

function rewriteUrlsInHTML(html: string, urlMap: Map<string, string>): string {
  return html.replace(/(src|href)=["']([^"']+)["']/g, (match, attr, url) => {
    if (
      url.startsWith('#') ||
      url.startsWith('data:') ||
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('mailto:') ||
      url.startsWith('tel:') ||
      isCSSFile(url) ||
      isJSFile(url)
    ) {
      return match;
    }

    const cleanUrl = url.replace(/^\.\//, '').replace(/^\//, '').replace(/\.\.\//g, '');
    for (const [key, resolvedUrl] of urlMap) {
      if (key === url || key === cleanUrl || key.endsWith('/' + cleanUrl) || key === url.split('/').pop()) {
        return `${attr}="${resolvedUrl}"`;
      }
    }

    return match;
  });
}

function extractInlineStyles(html: string): { cleanedHTML: string; extractedCSS: string } {
  let extractedCSS = '';

  const cleanedHTML = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, cssContent) => {
    extractedCSS += cssContent + '\n';
    return '';
  });

  return { cleanedHTML, extractedCSS };
}
