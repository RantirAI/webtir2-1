import { ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';
import { exportStylesheet } from './export';

// Export HTML for a single page
export function exportHTML(rootInstance: ComponentInstance, title: string = 'My Page'): string {
  const html = instanceToHTML(rootInstance);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="../styles.css">
</head>
<body>
${html}
  <script src="../script.js"></script>
</body>
</html>`;
}

// Export HTML for multiple pages
export function exportMultiPageHTML(pages: Array<{ id: string; name: string; rootInstance: ComponentInstance }>): Record<string, string> {
  const pageFiles: Record<string, string> = {};
  
  pages.forEach(page => {
    const fileName = page.name.toLowerCase().replace(/\s+/g, '-');
    pageFiles[`pages/${fileName}.html`] = exportHTML(page.rootInstance, page.name);
  });
  
  return pageFiles;
}

// Component types that should be wrapped with markers for code editor
const COMPONENT_TYPES = ['Section', 'Navigation', 'Header', 'Footer', 'Card', 'Accordion', 'Carousel', 'Tabs', 'Table', 'Form'];

function instanceToHTML(instance: ComponentInstance, indent: number = 1): string {
  const spaces = '  '.repeat(indent);
  const { styleSources } = useStyleStore.getState();
  
  // Check if this is a component that should be marked
  const isComponent = COMPONENT_TYPES.includes(instance.type);
  const componentLabel = instance.label || instance.type;
  
  // Get class names
  const classNames = instance.styleSourceIds
    ?.map(id => styleSources[id]?.name)
    .filter(Boolean)
    .join(' ') || '';
  
  const classAttr = classNames ? ` class="${classNames}"` : '';
  
  // Build ID attribute
  const idAttr = instance.idAttribute ? ` id="${instance.idAttribute}"` : '';
  
  // Build custom attributes
  let customAttrs = '';
  if (instance.attributes && Object.keys(instance.attributes).length > 0) {
    customAttrs = Object.entries(instance.attributes)
      .filter(([name]) => !['id', 'class', 'style', 'className'].includes(name.toLowerCase()))
      .map(([name, value]) => ` ${name}="${value}"`)
      .join('');
  }
  
  // Visibility attribute (data-hidden if hidden)
  const visibilityAttr = instance.visibility === 'hidden' ? ' style="display: none;"' : '';
  
  // Generate tag based on component type
  let tag = 'div';
  let selfClosing = false;
  let attrs = '';
  
  switch (instance.type) {
    case 'Text':
    case 'Cell':
      tag = 'p';
      break;
    case 'Heading':
      tag = instance.props.level || 'h2';
      break;
    case 'Button':
    case 'FormButton':
      tag = 'button';
      break;
    case 'Image':
      tag = 'img';
      selfClosing = true;
      attrs = ` src="${instance.props.src || ''}" alt="${instance.props.alt || ''}"`;
      break;
    case 'Video':
      tag = 'video';
      attrs = ` src="${instance.props.src || ''}"`;
      if (instance.props.autoplay) attrs += ' autoplay';
      if (instance.props.loop) attrs += ' loop';
      if (instance.props.muted) attrs += ' muted';
      if (instance.props.controls) attrs += ' controls';
      break;
    case 'Youtube':
      // YouTube embeds as iframe wrapper
      tag = 'div';
      const videoId = instance.props.videoId || 'dQw4w9WgXcQ';
      return `${spaces}<div${idAttr}${classAttr}${customAttrs} style="position: relative; width: 100%; padding-bottom: 56.25%;">\n${spaces}  <iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"></iframe>\n${spaces}</div>`;
    case 'Link':
      tag = 'a';
      attrs = ` href="${instance.props.href || '#'}"`;
      break;
    case 'Section':
      tag = instance.props.htmlTag || 'section';
      break;
    case 'TextInput':
      tag = 'input';
      selfClosing = true;
      attrs = ` type="text" placeholder="${instance.props.placeholder || ''}"`;
      break;
    case 'TextArea':
      tag = 'textarea';
      attrs = ` placeholder="${instance.props.placeholder || ''}"`;
      break;
    case 'InputLabel':
      tag = 'label';
      break;
    case 'CheckboxField':
      tag = 'input';
      selfClosing = true;
      attrs = ` type="checkbox"`;
      break;
    case 'RadioGroup':
      tag = 'input';
      selfClosing = true;
      attrs = ` type="radio"`;
      break;
    case 'Select':
      tag = 'select';
      break;
  }
  
  // Combine all attributes
  const allAttrs = `${idAttr}${classAttr}${attrs}${customAttrs}${visibilityAttr}`;
  
  // Get text content
  const textContent = instance.props.children || instance.props.text || '';
  
  // Build the HTML content
  let htmlContent = '';
  
  // Self-closing tags
  if (selfClosing) {
    htmlContent = `${spaces}<${tag}${allAttrs} />`;
  } else if (instance.children && instance.children.length > 0) {
    // Tags with children
    const childrenHTML = instance.children
      .map(child => instanceToHTML(child, indent + 1))
      .join('\n');
    htmlContent = `${spaces}<${tag}${allAttrs}>\n${childrenHTML}\n${spaces}</${tag}>`;
  } else if (textContent) {
    // Tags with text content
    htmlContent = `${spaces}<${tag}${allAttrs}>${textContent}</${tag}>`;
  } else {
    // Empty tags
    htmlContent = `${spaces}<${tag}${allAttrs}></${tag}>`;
  }
  
  // Wrap components with markers
  if (isComponent) {
    const markerSpaces = '  '.repeat(Math.max(0, indent - 1));
    return `${markerSpaces}<!-- @component:${componentLabel} -->\n${htmlContent}\n${markerSpaces}<!-- @/component:${componentLabel} -->`;
  }
  
  return htmlContent;
}

// Export CSS
export function exportCSS(): string {
  return exportStylesheet();
}

// Export JavaScript
export function exportJS(rootInstance: ComponentInstance): string {
  return `// Interactive functionality
document.addEventListener('DOMContentLoaded', () => {
  // Dropdown functionality
  const dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.dropdown-trigger');
    const menu = dropdown.querySelector('.dropdown-menu');
    
    if (trigger && menu) {
      trigger.addEventListener('click', () => {
        menu.style.display = menu.style.display === 'none' ? 'flex' : 'none';
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
          menu.style.display = 'none';
        }
      });
    }
  });
  
  // Form validation
  const forms = document.querySelectorAll('.form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get form data
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      console.log('Form submitted:', data);
      
      // Add your form submission logic here
      alert('Form submitted successfully!');
    });
  });
});
`;
}

// Export Astro (Rantir)
export function exportAstro(rootInstance: ComponentInstance): string {
  const html = instanceToHTML(rootInstance);
  
  return `---
// Astro component for Rantir framework
export interface Props {
  title?: string;
}

const { title = 'My Page' } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <style>
${exportCSS().split('\n').map(line => '    ' + line).join('\n')}
  </style>
</head>
<body>
${html}
  <script>
${exportJS(rootInstance).split('\n').map(line => '    ' + line).join('\n')}
  </script>
</body>
</html>`;
}
