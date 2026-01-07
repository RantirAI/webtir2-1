import JSZip from 'jszip';

export interface ExtractedContent {
  html: string;
  css: string;
  js: string;
}

/**
 * Extract HTML, CSS, and JS content from a ZIP file
 */
export async function extractZipContent(file: File): Promise<ExtractedContent> {
  const zip = await JSZip.loadAsync(file);
  
  let html = '';
  let css = '';
  let js = '';
  
  const files = Object.entries(zip.files);
  
  // Sort to prioritize index.html
  files.sort(([a], [b]) => {
    if (a.includes('index.html')) return -1;
    if (b.includes('index.html')) return 1;
    return 0;
  });
  
  for (const [filename, fileData] of files) {
    if (fileData.dir) continue;
    
    const lowerName = filename.toLowerCase();
    
    if (lowerName.endsWith('.html') && !html) {
      html = await fileData.async('text');
    } else if (lowerName.endsWith('.css')) {
      css += await fileData.async('text') + '\n';
    } else if (lowerName.endsWith('.js') && !lowerName.includes('.min.js')) {
      js += await fileData.async('text') + '\n';
    }
  }
  
  return { html, css, js };
}

/**
 * Extract embedded CSS from HTML (style tags and linked stylesheets content)
 */
export function extractEmbeddedCSS(html: string): string {
  let css = '';
  
  // Extract <style> tag contents
  const styleTagPattern = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match;
  
  while ((match = styleTagPattern.exec(html)) !== null) {
    css += match[1] + '\n';
  }
  
  return css.trim();
}

/**
 * Remove style tags from HTML
 */
export function stripStyleTags(html: string): string {
  return html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
}

/**
 * Extract body content from full HTML document
 */
export function extractBodyContent(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return bodyMatch ? bodyMatch[1].trim() : html;
}
