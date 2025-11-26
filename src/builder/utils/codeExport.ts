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

function instanceToHTML(instance: ComponentInstance, indent: number = 1): string {
  const spaces = '  '.repeat(indent);
  const { styleSources } = useStyleStore.getState();
  
  // Get class names
  const classNames = instance.styleSourceIds
    ?.map(id => styleSources[id]?.name)
    .filter(Boolean)
    .join(' ') || '';
  
  const classAttr = classNames ? ` class="${classNames}"` : '';
  
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
    case 'Link':
      tag = 'a';
      attrs = ` href="${instance.props.href || '#'}"`;
      break;
    case 'Section':
      tag = 'section';
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
  
  // Get text content
  const textContent = instance.props.children || instance.props.text || '';
  
  // Self-closing tags
  if (selfClosing) {
    return `${spaces}<${tag}${classAttr}${attrs} />`;
  }
  
  // Tags with children
  if (instance.children && instance.children.length > 0) {
    const childrenHTML = instance.children
      .map(child => instanceToHTML(child, indent + 1))
      .join('\n');
    return `${spaces}<${tag}${classAttr}${attrs}>\n${childrenHTML}\n${spaces}</${tag}>`;
  }
  
  // Tags with text content
  if (textContent) {
    return `${spaces}<${tag}${classAttr}${attrs}>${textContent}</${tag}>`;
  }
  
  // Empty tags
  return `${spaces}<${tag}${classAttr}${attrs}></${tag}>`;
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
