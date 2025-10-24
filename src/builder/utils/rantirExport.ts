import JSZip from 'jszip';
import { ComponentInstance } from '../store/types';
import { downloadFile } from './export';
import { useStyleStore } from '../store/useStyleStore';

interface PropDefinition {
  name: string;
  type: string;
  defaultValue: any;
}

interface ComponentDefinition {
  name: string;
  filename: string;
  content: string;
  props: PropDefinition[];
  originalInstance: ComponentInstance;
}

// Detect the purpose/type of a section based on its content
function detectSectionPurpose(instance: ComponentInstance, index: number, total: number): string {
  const hasNavigation = (inst: ComponentInstance): boolean => {
    if (inst.type === 'Navigation') return true;
    return (inst.children || []).some(child => hasNavigation(child));
  };

  const hasForm = (inst: ComponentInstance): boolean => {
    if (inst.type === 'Form') return true;
    return (inst.children || []).some(child => hasForm(child));
  };

  const hasTable = (inst: ComponentInstance): boolean => {
    if (inst.type === 'Table') return true;
    return (inst.children || []).some(child => hasTable(child));
  };

  const hasLargeHeading = (inst: ComponentInstance): boolean => {
    if (inst.type === 'Heading' && (inst.props.level === 'h1' || inst.props.level === 'h2')) return true;
    return (inst.children || []).some(child => hasLargeHeading(child));
  };

  // Navigation section
  if (hasNavigation(instance)) return 'nav';
  
  // Footer (last section)
  if (index === total - 1) return 'footer';
  
  // Hero (first non-nav section with large heading)
  if (index <= 1 && hasLargeHeading(instance)) return 'hero';
  
  // Form section
  if (hasForm(instance)) return 'contact';
  
  // Table section
  if (hasTable(instance)) return 'pricing';
  
  // Default
  return 'generic';
}

// Extract props from an instance based on its purpose
function extractPropsFromInstance(instance: ComponentInstance, purpose: string): PropDefinition[] {
  const props: PropDefinition[] = [];

  const traverse = (inst: ComponentInstance, parentPurpose: string) => {
    switch (inst.type) {
      case 'Heading':
        if (parentPurpose === 'hero' || parentPurpose === 'generic') {
          const propName = inst.props.level === 'h1' ? 'headline' : 
                          inst.props.level === 'h2' ? 'subheadline' : 'title';
          props.push({
            name: propName,
            type: 'string',
            defaultValue: inst.props.text || 'Heading'
          });
        }
        break;

      case 'Text':
        if (parentPurpose === 'hero' && props.length > 0 && props.length < 2) {
          props.push({
            name: 'description',
            type: 'string',
            defaultValue: inst.props.text || 'Description'
          });
        }
        break;

      case 'Navigation':
        props.push({
          name: 'logo',
          type: 'string',
          defaultValue: inst.props.logo || 'Logo'
        });
        props.push({
          name: 'links',
          type: 'array',
          defaultValue: (inst.props.menuItems || []).map((item: any) => ({
            text: item.text || item,
            href: item.href || '#'
          }))
        });
        break;

      case 'Form':
        props.push({
          name: 'fields',
          type: 'array',
          defaultValue: (inst.props.fields || []).map((field: any) => ({
            type: field.type || 'text',
            name: field.name || 'field',
            label: field.label || 'Field',
            required: field.required || false
          }))
        });
        props.push({
          name: 'action',
          type: 'string',
          defaultValue: inst.props.action || '/api/contact'
        });
        break;

      case 'Youtube':
        props.push({
          name: 'videoId',
          type: 'string',
          defaultValue: inst.props.videoId || ''
        });
        props.push({
          name: 'autoplay',
          type: 'boolean',
          defaultValue: inst.props.autoplay || false
        });
        props.push({
          name: 'controls',
          type: 'boolean',
          defaultValue: inst.props.controls !== false
        });
        break;

      case 'Lottie':
        props.push({
          name: 'src',
          type: 'string',
          defaultValue: inst.props.src || ''
        });
        props.push({
          name: 'autoplay',
          type: 'boolean',
          defaultValue: inst.props.autoplay !== false
        });
        props.push({
          name: 'loop',
          type: 'boolean',
          defaultValue: inst.props.loop !== false
        });
        break;

      case 'Table':
        // Extract table structure as props
        props.push({
          name: 'columns',
          type: 'array',
          defaultValue: [] // Would need to parse table headers
        });
        props.push({
          name: 'rows',
          type: 'array',
          defaultValue: [] // Would need to parse table rows
        });
        break;
    }

    // Traverse children
    (inst.children || []).forEach(child => traverse(child, parentPurpose));
  };

  traverse(instance, purpose);
  return props;
}

// Get all Bootstrap and custom classes for an instance
function getInstanceClasses(instance: ComponentInstance): string {
  const styleStore = useStyleStore.getState();
  const classes: string[] = [];

  (instance.styleSourceIds || []).forEach(styleId => {
    const styleSource = styleStore.styleSources[styleId];
    if (styleSource?.name) {
      classes.push(styleSource.name);
    }
  });

  return classes.join(' ');
}

// Convert instance to Astro template syntax
function instanceToAstro(instance: ComponentInstance, indent: number = 0, propMapping: Map<string, string>): string {
  const spacing = '  '.repeat(indent);
  const classes = getInstanceClasses(instance);
  
  // Map component types to HTML tags
  const getTag = (type: string): string => {
    const tagMap: Record<string, string> = {
      'Section': 'section',
      'Container': 'div',
      'Box': 'div',
      'Heading': instance.props.level || 'h2',
      'Text': 'p',
      'Button': 'button',
      'Link': 'a',
      'Image': 'img',
      'OrderedList': 'ol',
      'UnorderedList': 'ul',
      'Blockquote': 'blockquote',
      'CodeBlock': 'pre',
    };
    return tagMap[type] || 'div';
  };

  const tag = getTag(instance.type);
  const classAttr = classes ? ` class="${classes}"` : '';

  // Handle special components
  if (instance.type === 'Navigation') {
    return `${spacing}<SiteNav logo={logo} links={links} />`;
  }

  if (instance.type === 'Form') {
    return `${spacing}<ContactForm fields={fields} action={action} />`;
  }

  if (instance.type === 'Youtube') {
    return `${spacing}<YouTubeEmbed videoId={videoId} autoplay={autoplay} controls={controls} />`;
  }

  if (instance.type === 'Lottie') {
    return `${spacing}<LottieAnimation client:idle src={src} autoplay={autoplay} loop={loop} />`;
  }

  // Handle self-closing tags
  if (instance.type === 'Image') {
    const src = instance.props.src || '/placeholder.svg';
    const alt = instance.props.alt || 'Image';
    return `${spacing}<img${classAttr} src="${src}" alt="${alt}" />`;
  }

  // Handle text content with prop replacement
  let content = instance.props.text || instance.props.content || '';
  
  // Check if this text should be replaced with a prop
  if (propMapping.has(content)) {
    content = `{${propMapping.get(content)}}`;
  }

  // Handle children
  const childrenHtml = (instance.children || [])
    .map(child => instanceToAstro(child, indent + 1, propMapping))
    .join('\n');

  if (childrenHtml) {
    return `${spacing}<${tag}${classAttr}>\n${childrenHtml}\n${spacing}</${tag}>`;
  } else if (content) {
    return `${spacing}<${tag}${classAttr}>${content}</${tag}>`;
  } else {
    return `${spacing}<${tag}${classAttr} />`;
  }
}

// Generate Astro component file
function generateAstroComponent(
  instance: ComponentInstance,
  componentName: string,
  props: PropDefinition[],
  purpose: string
): string {
  // Create prop mapping for text replacement
  const propMapping = new Map<string, string>();
  props.forEach(prop => {
    if (typeof prop.defaultValue === 'string') {
      propMapping.set(prop.defaultValue, prop.name);
    }
  });

  // Generate frontmatter
  let frontmatter = '---\n';
  
  if (props.length > 0) {
    // Generate interface if needed
    if (purpose === 'nav') {
      frontmatter += `interface Link {
  text: string;
  href: string;
}

`;
    } else if (purpose === 'contact') {
      frontmatter += `interface Field {
  type: string;
  name: string;
  label: string;
  required: boolean;
}

`;
    }

    // Generate props destructuring
    frontmatter += 'const {\n';
    props.forEach(prop => {
      const defaultVal = typeof prop.defaultValue === 'string' 
        ? `"${prop.defaultValue}"`
        : JSON.stringify(prop.defaultValue);
      frontmatter += `  ${prop.name} = ${defaultVal},\n`;
    });
    frontmatter += '} = Astro.props;\n';
  }
  
  frontmatter += '---\n\n';

  // Generate component body
  const body = instanceToAstro(instance, 0, propMapping);

  return frontmatter + body;
}

// Generate special components
function generateSiteNavComponent(): string {
  return `---
interface Link {
  text: string;
  href: string;
}

const { 
  logo = "Logo", 
  links = []
} = Astro.props;
---

<nav class="navbar navbar-expand-lg navbar-light bg-white">
  <div class="container">
    <a class="navbar-brand" href="/">{logo}</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ml-auto">
        {links.map((link: Link) => (
          <li class="nav-item">
            <a class="nav-link" href={link.href}>{link.text}</a>
          </li>
        ))}
      </ul>
    </div>
  </div>
</nav>`;
}

function generateContactFormComponent(): string {
  return `---
interface Field {
  type: string;
  name: string;
  label: string;
  required: boolean;
}

const {
  fields = [],
  action = "/api/contact"
} = Astro.props;
---

<form action={action} method="POST" class="w-100">
  {fields.map((field: Field) => (
    <div class="form-group">
      <label for={field.name} class="form-label">{field.label}</label>
      {field.type === 'textarea' ? (
        <textarea 
          class="form-control" 
          id={field.name} 
          name={field.name}
          required={field.required}
        />
      ) : (
        <input 
          type={field.type} 
          class="form-control" 
          id={field.name} 
          name={field.name}
          required={field.required}
        />
      )}
    </div>
  ))}
  <button type="submit" class="btn btn-primary">Submit</button>
</form>`;
}

function generateYouTubeEmbedComponent(): string {
  return `---
const { videoId, autoplay = false, controls = true } = Astro.props;
const embedUrl = \`https://www.youtube.com/embed/\${videoId}?autoplay=\${autoplay ? 1 : 0}&controls=\${controls ? 1 : 0}\`;
---

<div class="embed-responsive embed-responsive-16by9">
  <iframe 
    class="embed-responsive-item" 
    src={embedUrl}
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
  />
</div>`;
}

function generateLottieAnimationComponent(): string {
  return `---
const { src, autoplay = true, loop = true } = Astro.props;
---

<div 
  class="lottie-container"
  data-lottie-src={src}
  data-autoplay={autoplay}
  data-loop={loop}
/>

<script>
  import lottie from 'lottie-web';
  
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.lottie-container').forEach((container) => {
      const src = container.getAttribute('data-lottie-src');
      const autoplay = container.getAttribute('data-autoplay') === 'true';
      const loop = container.getAttribute('data-loop') === 'true';
      
      if (src) {
        lottie.loadAnimation({
          container: container as HTMLElement,
          renderer: 'svg',
          loop,
          autoplay,
          path: src
        });
      }
    });
  });
</script>`;
}

// Generate index.astro page
function generateIndexPage(components: ComponentDefinition[], projectName: string): string {
  let imports = '';
  let componentCalls = '';
  let propsDeclarations = '';

  components.forEach((comp, idx) => {
    const componentTag = comp.name;
    imports += `import ${componentTag} from '../components/${comp.filename}';\n`;

    if (comp.props.length > 0) {
      const propsVarName = `${componentTag.toLowerCase()}Props`;
      propsDeclarations += `\nconst ${propsVarName} = ${JSON.stringify(
        comp.props.reduce((acc, prop) => {
          acc[prop.name] = prop.defaultValue;
          return acc;
        }, {} as any),
        null,
        2
      )};\n`;

      componentCalls += `  <${componentTag} {...${propsVarName}} />\n`;
    } else {
      componentCalls += `  <${componentTag} />\n`;
    }
  });

  return `---
${imports}
import '../styles/global.css';
${propsDeclarations}
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css">
</head>
<body>
${componentCalls}
  <script src="https://code.jquery.com/jquery-3.6.0.slim.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
}

// Generate global CSS file
function generateGlobalCSS(): string {
  return `/* Custom styles for Rantir Framework project */
/* Add your custom CSS here */

body {
  margin: 0;
  padding: 0;
}

.lottie-container {
  width: 100%;
  height: auto;
  min-height: 200px;
}
`;
}

// Generate Astro config
function generateAstroConfig(): string {
  return `import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  build: {
    format: 'directory'
  }
});
`;
}

// Generate package.json
function generatePackageJson(projectName: string): string {
  return JSON.stringify({
    name: projectName.toLowerCase().replace(/\s+/g, '-'),
    version: '1.0.0',
    type: 'module',
    scripts: {
      dev: 'astro dev',
      build: 'astro build',
      preview: 'astro preview'
    },
    dependencies: {
      astro: '^4.0.0',
      bootstrap: '^4.6.2',
      'lottie-web': '^5.12.2'
    }
  }, null, 2);
}

// Generate tsconfig.json
function generateTsConfig(): string {
  return JSON.stringify({
    extends: 'astro/tsconfigs/strict',
    compilerOptions: {
      jsx: 'react-jsx',
      jsxImportSource: 'react'
    }
  }, null, 2);
}

// Generate README
function generateReadme(projectName: string): string {
  return `# ${projectName}

## Webtir by Rantir

This project was generated using **Webtir**, a powerful visual website builder by Rantir, and exported as a **Rantir Framework** project (Astro-based).

For more information about Webtir and our versions, visit:
**[www.rantir.com/documentation](https://www.rantir.com/documentation)**

## Getting Started

### Installation
\`\`\`bash
npm install
\`\`\`

### Development
\`\`\`bash
npm run dev
\`\`\`

Open http://localhost:4321 in your browser.

### Build for Production
\`\`\`bash
npm run build
\`\`\`

## Project Structure

- \`src/components/\` - Reusable Astro components
- \`src/pages/\` - Page routes (index.astro is your homepage)
- \`src/styles/\` - Global CSS styles
- \`public/\` - Static assets

## Features

- ✅ **Astro Framework** - Fast, modern static site generator
- ✅ **Bootstrap 4 Compatible** - All original Bootstrap classes preserved
- ✅ **Component-Based** - Reusable sections with props
- ✅ **Type-Safe** - TypeScript support out of the box
- ✅ **SEO Optimized** - Server-side rendering for best performance
- ✅ **Interactive Islands** - Lottie animations and interactive elements

## Customization

Each component in \`src/components/\` accepts props for easy customization. Check the frontmatter of each component to see available options.

## Deployment

Deploy to:
- Vercel (recommended for Astro)
- Netlify
- Cloudflare Pages
- GitHub Pages

## Support

For documentation, tutorials, and support:
- Visit: [www.rantir.com/documentation](https://www.rantir.com/documentation)
- Built with Webtir by Rantir

Enjoy building with Webtir and Rantir Framework! 🚀
`;
}

// Main export function
export async function exportRantirProject(
  rootInstance: ComponentInstance,
  projectName: string = 'my-project'
): Promise<void> {
  const zip = new JSZip();
  const components: ComponentDefinition[] = [];
  
  // Track which special components we need
  const needsYouTube = new Set<boolean>();
  const needsLottie = new Set<boolean>();

  // Check what special components are needed
  const checkForSpecialComponents = (instance: ComponentInstance) => {
    if (instance.type === 'Youtube') needsYouTube.add(true);
    if (instance.type === 'Lottie') needsLottie.add(true);
    (instance.children || []).forEach(checkForSpecialComponents);
  };
  checkForSpecialComponents(rootInstance);

  // Process top-level sections
  const sections = rootInstance.children || [];
  sections.forEach((section, index) => {
    const purpose = detectSectionPurpose(section, index, sections.length);
    const props = extractPropsFromInstance(section, purpose);

    let componentName = '';
    let filename = '';

    switch (purpose) {
      case 'nav':
        componentName = 'SiteNav';
        filename = 'SiteNav.astro';
        components.push({
          name: componentName,
          filename,
          content: generateSiteNavComponent(),
          props,
          originalInstance: section
        });
        break;
      
      case 'hero':
        componentName = 'HeroSection';
        filename = 'HeroSection.astro';
        components.push({
          name: componentName,
          filename,
          content: generateAstroComponent(section, componentName, props, purpose),
          props,
          originalInstance: section
        });
        break;
      
      case 'contact':
        componentName = 'ContactForm';
        filename = 'ContactForm.astro';
        components.push({
          name: componentName,
          filename,
          content: generateContactFormComponent(),
          props,
          originalInstance: section
        });
        break;
      
      case 'pricing':
        componentName = 'PricingSection';
        filename = 'PricingSection.astro';
        components.push({
          name: componentName,
          filename,
          content: generateAstroComponent(section, componentName, props, purpose),
          props,
          originalInstance: section
        });
        break;
      
      case 'footer':
        componentName = 'FooterSection';
        filename = 'FooterSection.astro';
        components.push({
          name: componentName,
          filename,
          content: generateAstroComponent(section, componentName, props, purpose),
          props,
          originalInstance: section
        });
        break;
      
      default:
        componentName = `Section${index + 1}`;
        filename = `Section${index + 1}.astro`;
        components.push({
          name: componentName,
          filename,
          content: generateAstroComponent(section, componentName, props, purpose),
          props,
          originalInstance: section
        });
    }
  });

  // Add special components if needed
  if (needsYouTube.size > 0) {
    zip.file('src/components/YouTubeEmbed.astro', generateYouTubeEmbedComponent());
  }
  if (needsLottie.size > 0) {
    zip.file('src/components/LottieAnimation.astro', generateLottieAnimationComponent());
  }

  // Add all components to zip
  components.forEach(comp => {
    zip.file(`src/components/${comp.filename}`, comp.content);
  });

  // Add pages
  zip.file('src/pages/index.astro', generateIndexPage(components, projectName));

  // Add styles
  zip.file('src/styles/global.css', generateGlobalCSS());

  // Add config files
  zip.file('astro.config.mjs', generateAstroConfig());
  zip.file('package.json', generatePackageJson(projectName));
  zip.file('tsconfig.json', generateTsConfig());
  zip.file('README.md', generateReadme(projectName));

  // Create public directory with placeholder
  zip.file('public/.gitkeep', '');

  // Generate and download zip
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadFile(`${projectName}-rantir.zip`, blob);
}
