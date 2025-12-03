import JSZip from 'jszip';
import { ComponentInstance, StyleDeclaration } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';
import { componentRegistry } from '../primitives/registry';

// Map custom property names to valid CSS property names
const propertyAliases: Record<string, string> = {
  backgroundGradient: 'background-image',
};

// Convert style object to CSS string
function styleObjectToCSS(styles: StyleDeclaration): string {
  return Object.entries(styles)
    .filter(([_, value]) => value && value !== 'initial' && value !== 'inherit')
    .map(([property, value]) => {
      // Check for property alias first
      let cssProperty = propertyAliases[property];
      if (!cssProperty) {
        // Convert camelCase to kebab-case
        cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
      }
      return `  ${cssProperty}: ${value};`;
    })
    .join('\n');
}

// Generate CSS stylesheet from all style sources
export function exportStylesheet(): string {
  const { styleSources, styles, breakpoints } = useStyleStore.getState();
  let css = `/* Auto-generated styles from Visual Builder */
/* Bootstrap 4 Compatible */

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #212529;
  background-color: #fff;
}

`;

  const states = ['default', 'hover', 'focus', 'active', 'visited'];

  // Group styles by class name
  Object.values(styleSources).forEach(source => {
    const className = source.name.trim();
    if (!className) return;

    states.forEach(state => {
      const stateSelector = state === 'default' 
        ? `.${className}` 
        : state === 'focus'
        ? `.${className}:focus-visible`
        : `.${className}:${state}`;

      // Base styles for this state
      const baseStyles: StyleDeclaration = {};
      Object.entries(styles).forEach(([key, value]) => {
        const parts = key.split(':');
        if (parts.length === 4 && parts[0] === source.id && parts[1] === 'base' && parts[2] === state) {
          const property = parts[3];
          baseStyles[property] = value;
        }
      });

      if (Object.keys(baseStyles).length > 0) {
        css += `${stateSelector} {\n${styleObjectToCSS(baseStyles)}\n}\n\n`;
      }

      // Responsive styles for this state
      breakpoints.forEach(breakpoint => {
        if (breakpoint.id === 'base') return;

        const responsiveStyles: StyleDeclaration = {};
        Object.entries(styles).forEach(([key, value]) => {
          const parts = key.split(':');
          if (parts.length === 4 && parts[0] === source.id && parts[1] === breakpoint.id && parts[2] === state) {
            const property = parts[3];
            responsiveStyles[property] = value;
          }
        });

        if (Object.keys(responsiveStyles).length > 0) {
          const mediaQuery = breakpoint.maxWidth 
            ? `@media (max-width: ${breakpoint.maxWidth}px)`
            : `@media (min-width: ${breakpoint.minWidth}px)`;
          
          css += `${mediaQuery} {\n  ${stateSelector} {\n${styleObjectToCSS(responsiveStyles).split('\n').map(line => '  ' + line).join('\n')}\n  }\n}\n\n`;
        }
      });
    });
  });

  return css;
}

// Convert component instance to React JSX
function instanceToReact(instance: ComponentInstance, indent: number = 0): string {
  const spaces = '  '.repeat(indent);
  const meta = componentRegistry[instance.type];
  
  if (!meta) return '';

  const tag = instance.type === 'Div' ? 'div' : 
              instance.type === 'Container' ? 'div' :
              instance.type === 'Section' ? (instance.props.htmlTag || 'section') :
              instance.type === 'Text' ? 'p' :
              instance.type === 'Heading' ? (instance.props.level || 'h2') :
              instance.type === 'Button' ? 'button' :
              instance.type === 'Image' ? 'img' :
              instance.type === 'Link' ? 'a' : 'div';

  // Get class names
  const { styleSources } = useStyleStore.getState();
  const classNames = instance.styleSourceIds
    ?.map(id => styleSources[id]?.name)
    .filter(name => name && name.trim())
    .join(' ');

  // Build props
  const props: string[] = [];
  if (classNames) {
    props.push(`className="${classNames}"`);
  }

  // Add component-specific props
  if (instance.type === 'Image' && instance.props.src) {
    props.push(`src="${instance.props.src}"`);
    if (instance.props.alt) props.push(`alt="${instance.props.alt}"`);
  }
  if (instance.type === 'Link' && instance.props.href) {
    props.push(`href="${instance.props.href}"`);
  }

  const propsString = props.length > 0 ? ' ' + props.join(' ') : '';

  // Handle children
  const hasChildren = instance.children && instance.children.length > 0;
  const textContent = instance.props.text || instance.props.children || '';

  if (instance.type === 'Image') {
    return `${spaces}<${tag}${propsString} />`;
  }

  if (!hasChildren && !textContent) {
    return `${spaces}<${tag}${propsString} />`;
  }

  let content = '';
  if (hasChildren) {
    content = '\n' + instance.children.map(child => 
      instanceToReact(child, indent + 1)
    ).join('\n') + '\n' + spaces;
  } else if (textContent) {
    content = textContent;
  }

  return `${spaces}<${tag}${propsString}>${content}</${tag}>`;
}

// Export as React component
export function exportReactComponent(rootInstance: ComponentInstance, componentName: string = 'MyComponent'): string {
  const jsx = rootInstance.children.map(child => instanceToReact(child, 1)).join('\n');

  return `import React from 'react';
import './styles.css';

export const ${componentName} = () => {
  return (
    <div className="${rootInstance.styleSourceIds?.map(id => 
      useStyleStore.getState().styleSources[id]?.name
    ).filter(Boolean).join(' ') || ''}">
${jsx}
    </div>
  );
};
`;
}

// Convert component instance to HTML
function instanceToHTML(instance: ComponentInstance, indent: number = 0): string {
  const spaces = '  '.repeat(indent);
  const meta = componentRegistry[instance.type];
  
  if (!meta) return '';

  const tag = instance.type === 'Div' ? 'div' : 
              instance.type === 'Container' ? 'div' :
              instance.type === 'Section' ? (instance.props.htmlTag || 'section') :
              instance.type === 'Text' ? 'p' :
              instance.type === 'Heading' ? (instance.props.level || 'h2') :
              instance.type === 'Button' ? 'button' :
              instance.type === 'Image' ? 'img' :
              instance.type === 'Link' ? 'a' :
              instance.type === 'Video' ? 'video' :
              instance.type === 'Youtube' ? 'div' :
              instance.type === 'Lottie' ? 'div' : 'div';

  // Get class names
  const { styleSources } = useStyleStore.getState();
  const classNames = instance.styleSourceIds
    ?.map(id => styleSources[id]?.name)
    .filter(name => name && name.trim())
    .join(' ');

  // Build attributes
  const attrs: string[] = [];
  if (classNames) {
    attrs.push(`class="${classNames}"`);
  }

  // Add component-specific attributes
  if (instance.type === 'Image' && instance.props.src) {
    attrs.push(`src="${instance.props.src}"`);
    if (instance.props.alt) attrs.push(`alt="${instance.props.alt}"`);
  }
  if (instance.type === 'Link' && instance.props.href) {
    attrs.push(`href="${instance.props.href}"`);
  }
  if (instance.type === 'Video' && instance.props.src) {
    attrs.push(`src="${instance.props.src}"`);
    if (instance.props.controls) attrs.push('controls');
    if (instance.props.autoplay) attrs.push('autoplay');
    if (instance.props.loop) attrs.push('loop');
    if (instance.props.muted) attrs.push('muted');
  }
  if (instance.type === 'Youtube' && instance.props.videoId) {
    attrs.push(`data-video-id="${instance.props.videoId}"`);
    attrs.push('class="youtube-embed"');
  }

  const attrsString = attrs.length > 0 ? ' ' + attrs.join(' ') : '';

  // Handle children
  const hasChildren = instance.children && instance.children.length > 0;
  const textContent = instance.props.text || instance.props.children || '';

  if (instance.type === 'Image') {
    return `${spaces}<${tag}${attrsString}>`;
  }

  if (instance.type === 'Youtube') {
    const videoId = instance.props.videoId || 'dQw4w9WgXcQ';
    return `${spaces}<div${attrsString}>
${spaces}  <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width: 100%; aspect-ratio: 16/9;"></iframe>
${spaces}</div>`;
  }

  if (!hasChildren && !textContent) {
    return `${spaces}<${tag}${attrsString}></${tag}>`;
  }

  let content = '';
  if (hasChildren) {
    content = '\n' + instance.children.map(child => 
      instanceToHTML(child, indent + 1)
    ).join('\n') + '\n' + spaces;
  } else if (textContent) {
    content = textContent;
  }

  return `${spaces}<${tag}${attrsString}>${content}</${tag}>`;
}

// Export as HTML with embedded CSS
export function exportHTML(rootInstance: ComponentInstance, title: string = 'My Page'): string {
  const bodyContent = rootInstance.children.map(child => instanceToHTML(child, 2)).join('\n');
  const { styleSources } = useStyleStore.getState();
  const rootClasses = rootInstance.styleSourceIds
    ?.map(id => styleSources[id]?.name)
    .filter(Boolean)
    .join(' ') || '';
  
  const css = exportStylesheet();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div${rootClasses ? ` class="${rootClasses}"` : ''}>
${bodyContent}
  </div>
</body>
</html>`;
}

// Download file helper
export function downloadFile(filename: string, content: string | Blob) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export project as zip
export async function exportProject(rootInstance: ComponentInstance, projectName: string = 'my-project') {
  const zip = new JSZip();
  
  // Generate files
  const css = exportStylesheet();
  const html = exportHTML(rootInstance, projectName);
  
  // Create a simple JS file for Bootstrap 4 compatibility
  const js = `// Bootstrap 4 Compatible JavaScript
document.addEventListener('DOMContentLoaded', function() {
  console.log('${projectName} loaded successfully');
  
  // Initialize YouTube embeds
  const youtubeEmbeds = document.querySelectorAll('.youtube-embed');
  youtubeEmbeds.forEach(function(embed) {
    const videoId = embed.getAttribute('data-video-id');
    if (videoId) {
      const iframe = embed.querySelector('iframe');
      if (iframe) {
        iframe.src = 'https://www.youtube.com/embed/' + videoId;
      }
    }
  });
});
`;

  // Add files to zip
  zip.file('index.html', html);
  zip.file('styles.css', css);
  zip.file('script.js', js);
  
  // Add README
  const readme = `# ${projectName}

## Webtir by Rantir

This project was generated using **Webtir**, a powerful visual website builder by Rantir.

For more information about Webtir and our versions, visit:
**[www.rantir.com/documentation](https://www.rantir.com/documentation)**

## Files Included
- **index.html** - Main HTML file
- **styles.css** - All compiled styles (Bootstrap 4 compatible)
- **script.js** - JavaScript for interactivity

## Usage
Simply open index.html in your web browser to view your website.

## Deployment
You can deploy these files to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Amazon S3
- Any web hosting service

## Features
- Bootstrap 4 compatible code structure
- Responsive design
- Clean, semantic HTML
- Optimized CSS with media queries
- Cross-browser compatible

## Support
For documentation, tutorials, and support:
- Visit: [www.rantir.com/documentation](https://www.rantir.com/documentation)
- Built with Webtir by Rantir

Enjoy building with Webtir! 🚀
`;
  
  zip.file('README.md', readme);
  
  // Generate and download zip
  const content = await zip.generateAsync({ type: 'blob' });
  downloadFile(`${projectName}.zip`, content);
}
