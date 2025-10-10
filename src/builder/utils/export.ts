import { ComponentInstance, StyleDeclaration } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';
import { componentRegistry } from '../primitives/registry';

// Convert style object to CSS string
function styleObjectToCSS(styles: StyleDeclaration): string {
  return Object.entries(styles)
    .filter(([_, value]) => value && value !== 'initial' && value !== 'inherit')
    .map(([property, value]) => {
      // Convert camelCase to kebab-case
      const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `  ${cssProperty}: ${value};`;
    })
    .join('\n');
}

// Generate CSS stylesheet from all style sources
export function exportStylesheet(): string {
  const { styleSources, styles, breakpoints } = useStyleStore.getState();
  let css = '/* Auto-generated styles from Visual Builder */\n\n';

  // Group styles by class name
  Object.values(styleSources).forEach(source => {
    const className = source.name.trim();
    if (!className) return;

    // Base styles
    const baseStyles: StyleDeclaration = {};
    Object.entries(styles).forEach(([key, value]) => {
      if (key.startsWith(`${source.id}:base:`)) {
        const property = key.split(':')[2];
        baseStyles[property] = value;
      }
    });

    if (Object.keys(baseStyles).length > 0) {
      css += `.${className} {\n${styleObjectToCSS(baseStyles)}\n}\n\n`;
    }

    // Responsive styles
    breakpoints.forEach(breakpoint => {
      if (breakpoint.id === 'base') return;

      const responsiveStyles: StyleDeclaration = {};
      Object.entries(styles).forEach(([key, value]) => {
        if (key.startsWith(`${source.id}:${breakpoint.id}:`)) {
          const property = key.split(':')[2];
          responsiveStyles[property] = value;
        }
      });

      if (Object.keys(responsiveStyles).length > 0) {
        const mediaQuery = breakpoint.maxWidth 
          ? `@media (max-width: ${breakpoint.maxWidth}px)`
          : `@media (min-width: ${breakpoint.minWidth}px)`;
        
        css += `${mediaQuery} {\n  .${className} {\n${styleObjectToCSS(responsiveStyles).split('\n').map(line => '  ' + line).join('\n')}\n  }\n}\n\n`;
      }
    });
  });

  return css;
}

// Convert component instance to React JSX
function instanceToReact(instance: ComponentInstance, indent: number = 0): string {
  const spaces = '  '.repeat(indent);
  const meta = componentRegistry[instance.type];
  
  if (!meta) return '';

  const tag = instance.type === 'Box' ? 'div' : 
              instance.type === 'Container' ? 'div' :
              instance.type === 'Section' ? 'section' :
              instance.type === 'Text' ? 'p' :
              instance.type === 'Heading' ? 'h2' :
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

  const tag = instance.type === 'Box' ? 'div' : 
              instance.type === 'Container' ? 'div' :
              instance.type === 'Section' ? 'section' :
              instance.type === 'Text' ? 'p' :
              instance.type === 'Heading' ? 'h2' :
              instance.type === 'Button' ? 'button' :
              instance.type === 'Image' ? 'img' :
              instance.type === 'Link' ? 'a' : 'div';

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

  const attrsString = attrs.length > 0 ? ' ' + attrs.join(' ') : '';

  // Handle children
  const hasChildren = instance.children && instance.children.length > 0;
  const textContent = instance.props.text || instance.props.children || '';

  if (instance.type === 'Image') {
    return `${spaces}<${tag}${attrsString}>`;
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

// Export as HTML
export function exportHTML(rootInstance: ComponentInstance, title: string = 'My Page'): string {
  const bodyContent = rootInstance.children.map(child => instanceToHTML(child, 2)).join('\n');
  const { styleSources } = useStyleStore.getState();
  const rootClasses = rootInstance.styleSourceIds
    ?.map(id => styleSources[id]?.name)
    .filter(Boolean)
    .join(' ') || '';

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
export function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export project as zip (requires JSZip library)
export function exportProject(rootInstance: ComponentInstance, projectName: string = 'my-project') {
  // For now, download individual files
  // TODO: Integrate JSZip for proper zip export
  
  const css = exportStylesheet();
  const react = exportReactComponent(rootInstance, 'App');
  const html = exportHTML(rootInstance, projectName);

  downloadFile(`${projectName}.css`, css);
  downloadFile(`${projectName}.jsx`, react);
  downloadFile(`${projectName}.html`, html);
}
