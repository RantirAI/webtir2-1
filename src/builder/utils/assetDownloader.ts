/**
 * Asset Downloader Utility
 * Downloads external assets (images, etc.) and stores them in the Media Library
 * Runs entirely in the browser using fetch + FileReader
 */

import { useMediaStore } from '../store/useMediaStore';

export interface DownloadedAsset {
  dataUrl: string;
  assetId: string;
  name: string;
  mimeType: string;
  size: number;
}

/**
 * Get or create the "imports" folder in the media library
 */
function getOrCreateImportFolder(): string | null {
  const { folders, addFolder } = useMediaStore.getState();
  const importFolder = Object.values(folders).find(f => f.name === 'imports');
  if (importFolder) return importFolder.id;
  return addFolder('imports', null);
}

/**
 * Convert a Blob to Data URL using FileReader
 */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read blob'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Extract filename from URL
 */
function extractFilename(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split('/').pop() || 'asset';
    // Remove query strings if any
    return filename.split('?')[0];
  } catch {
    return 'asset';
  }
}

/**
 * Download a single asset and return its data URL
 * Uses no-cors mode with fallback to regular fetch
 */
async function downloadSingleAsset(
  asset: { url: string; alt: string; name: string }
): Promise<DownloadedAsset | null> {
  try {
    // First attempt with cors mode
    let response: Response;
    try {
      response = await fetch(asset.url, { mode: 'cors' });
    } catch {
      // If CORS fails, the asset can't be downloaded in browser
      console.warn(`[AssetDownloader] CORS blocked: ${asset.url}`);
      return null;
    }

    if (!response.ok) {
      console.warn(`[AssetDownloader] Failed to fetch: ${asset.url} (${response.status})`);
      return null;
    }

    const blob = await response.blob();
    const dataUrl = await blobToDataUrl(blob);
    
    // Determine filename
    const name = asset.name || extractFilename(asset.url);
    
    // Add to media store
    const folderId = getOrCreateImportFolder();
    const assetId = useMediaStore.getState().addAsset({
      name,
      type: 'image', // Will be auto-detected by mimeType in store
      url: dataUrl,
      size: blob.size,
      mimeType: blob.type || 'image/png',
      altText: asset.alt || '',
      folderId,
    });

    console.log(`[AssetDownloader] Downloaded: ${name} (${(blob.size / 1024).toFixed(1)}KB)`);

    return {
      dataUrl,
      assetId,
      name,
      mimeType: blob.type,
      size: blob.size,
    };
  } catch (error) {
    console.warn(`[AssetDownloader] Error downloading: ${asset.url}`, error);
    return null;
  }
}

/**
 * Download multiple assets in parallel and return a URL mapping
 * Maps original URL -> downloaded asset info
 */
export async function downloadAssets(
  assets: Array<{ url: string; alt: string; name: string }>,
  onProgress?: (downloaded: number, total: number) => void
): Promise<Map<string, DownloadedAsset>> {
  const urlMapping = new Map<string, DownloadedAsset>();
  
  if (assets.length === 0) return urlMapping;
  
  console.log(`[AssetDownloader] Starting download of ${assets.length} assets...`);
  
  // Download in batches of 5 to avoid overwhelming the browser
  const batchSize = 5;
  let downloaded = 0;
  
  for (let i = 0; i < assets.length; i += batchSize) {
    const batch = assets.slice(i, i + batchSize);
    
    const results = await Promise.all(
      batch.map(async (asset) => {
        const result = await downloadSingleAsset(asset);
        downloaded++;
        onProgress?.(downloaded, assets.length);
        return { url: asset.url, result };
      })
    );
    
    for (const { url, result } of results) {
      if (result) {
        urlMapping.set(url, result);
      }
    }
    
    // Small delay between batches to prevent overwhelming
    if (i + batchSize < assets.length) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  console.log(`[AssetDownloader] Downloaded ${urlMapping.size}/${assets.length} assets successfully`);
  
  return urlMapping;
}

/**
 * Check if a URL is an external URL that should be downloaded
 */
export function isExternalUrl(url: string): boolean {
  if (!url) return false;
  
  // Data URLs are already local
  if (url.startsWith('data:')) return false;
  
  // Relative URLs are local
  if (url.startsWith('/') || url.startsWith('./')) return false;
  
  // Blob URLs are local
  if (url.startsWith('blob:')) return false;
  
  // HTTP/HTTPS URLs are external
  return url.startsWith('http://') || url.startsWith('https://');
}
