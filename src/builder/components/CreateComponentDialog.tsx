import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useComponentInstanceStore } from '../store/useComponentInstanceStore';
import { useStyleStore } from '../store/useStyleStore';
import { ComponentInstance, ComponentType } from '../store/types';
import { generateId } from '../utils/instance';
import { toast } from 'sonner';

interface CreateComponentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Simple HTML parser to convert HTML string to ComponentInstance
function parseHTMLToInstance(html: string, css: string): ComponentInstance | null {
  const trimmedHtml = html.trim();
  if (!trimmedHtml) return null;

  // Create a temporary DOM element to parse HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(trimmedHtml, 'text/html');
  const body = doc.body;

  if (!body.firstElementChild) {
    // If no valid element, wrap in a div
    return {
      id: generateId(),
      type: 'Div' as ComponentType,
      label: 'Div',
      props: {},
      styleSourceIds: [],
      children: [],
    };
  }

  const { createStyleSource, setStyle, getNextAutoClassName } = useStyleStore.getState();

  // Parse CSS rules
  const cssRules: Record<string, Record<string, string>> = {};
  if (css.trim()) {
    const cssRegex = /\.([a-zA-Z0-9_-]+)\s*\{([^}]*)\}/g;
    let match;
    while ((match = cssRegex.exec(css)) !== null) {
      const className = match[1];
      const rules = match[2];
      cssRules[className] = {};
      
      rules.split(';').forEach(rule => {
        const [prop, value] = rule.split(':').map(s => s.trim());
        if (prop && value) {
          // Convert kebab-case to camelCase
          const camelProp = prop.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
          cssRules[className][camelProp] = value;
        }
      });
    }
  }

  function elementToInstance(el: Element): ComponentInstance {
    const tagName = el.tagName.toLowerCase();
    const id = generateId();
    
    // Map HTML tags to component types
    const tagToType: Record<string, ComponentType> = {
      'div': 'Div',
      'section': 'Section',
      'header': 'Div',
      'footer': 'Div',
      'nav': 'Div',
      'main': 'Div',
      'article': 'Div',
      'aside': 'Div',
      'span': 'Text',
      'p': 'Text',
      'h1': 'Heading',
      'h2': 'Heading',
      'h3': 'Heading',
      'h4': 'Heading',
      'h5': 'Heading',
      'h6': 'Heading',
      'a': 'Link',
      'button': 'Button',
      'img': 'Image',
      'video': 'Video',
      'input': 'TextInput',
      'textarea': 'TextArea',
      'form': 'Div',
      'ul': 'UnorderedList',
      'ol': 'OrderedList',
      'blockquote': 'Blockquote',
    };

    const type = tagToType[tagName] || 'Div';
    const label = type;

    // Extract props based on type
    const props: Record<string, any> = {};
    
    if (type === 'Heading') {
      props.level = tagName as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      props.children = el.textContent || 'Heading';
    } else if (type === 'Text') {
      props.children = el.textContent || 'Text';
    } else if (type === 'Link') {
      props.href = el.getAttribute('href') || '#';
      props.children = el.textContent || 'Link';
    } else if (type === 'Button') {
      props.children = el.textContent || 'Button';
    } else if (type === 'Image') {
      props.src = el.getAttribute('src') || '';
      props.alt = el.getAttribute('alt') || '';
    }

    // Create style source from class
    const styleSourceIds: string[] = [];
    const classAttr = el.getAttribute('class');
    if (classAttr) {
      const classes = classAttr.split(' ').filter(c => c.trim());
      classes.forEach(className => {
        const styleId = createStyleSource('local', className);
        styleSourceIds.push(styleId);
        
        // Apply CSS rules if found
        if (cssRules[className]) {
          Object.entries(cssRules[className]).forEach(([prop, value]) => {
            setStyle(styleId, prop, value);
          });
        }
      });
    }

    // If no class, create an auto-class
    if (styleSourceIds.length === 0) {
      const autoClassName = getNextAutoClassName(type.toLowerCase());
      const styleId = createStyleSource('local', autoClassName);
      styleSourceIds.push(styleId);
    }

    // Recursively process children (only element nodes, not text nodes for container types)
    const children: ComponentInstance[] = [];
    if (['Div', 'Section'].includes(type)) {
      Array.from(el.children).forEach(child => {
        children.push(elementToInstance(child));
      });
    }

    return {
      id,
      type,
      label,
      props,
      styleSourceIds,
      children,
    };
  }

  return elementToInstance(body.firstElementChild);
}

export const CreateComponentDialog: React.FC<CreateComponentDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [name, setName] = useState('');
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const { addPrebuilt, linkInstance } = useComponentInstanceStore();

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error('Please enter a component name');
      return;
    }

    if (!htmlCode.trim()) {
      toast.error('Please enter HTML code for the component');
      return;
    }

    // Parse HTML to instance
    const instance = parseHTMLToInstance(htmlCode, cssCode);
    if (!instance) {
      toast.error('Could not parse HTML code');
      return;
    }

    // Update the root element label to match the component name
    instance.label = name.trim();

    // Create prebuilt from the parsed instance
    const prebuiltId = addPrebuilt(name.trim(), instance);
    
    // Link the instance as master
    const allStyleSourceIds = [...new Set(collectStyleSourceIds(instance))];
    const styleIdMapping: Record<string, string> = {};
    allStyleSourceIds.forEach(id => {
      styleIdMapping[id] = id;
    });
    
    linkInstance(instance.id, prebuiltId, styleIdMapping, true);
    
    toast.success(`Component "${name.trim()}" created successfully`);
    
    // Reset form
    setName('');
    setHtmlCode('');
    setCssCode('');
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleCreate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Component</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="component-name">Component Name</Label>
            <Input
              id="component-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Header, Footer, Card..."
              autoFocus
            />
          </div>

          <Tabs defaultValue="html" className="flex-1">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="css">CSS</TabsTrigger>
            </TabsList>
            
            <TabsContent value="html" className="mt-2">
              <div className="space-y-2">
                <Label htmlFor="html-code">HTML Code</Label>
                <Textarea
                  id="html-code"
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`<section class="header">
  <nav class="nav">
    <a href="/" class="logo">Logo</a>
  </nav>
</section>`}
                  className="font-mono text-xs min-h-[200px] resize-none"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="css" className="mt-2">
              <div className="space-y-2">
                <Label htmlFor="css-code">CSS Code (Optional)</Label>
                <Textarea
                  id="css-code"
                  value={cssCode}
                  onChange={(e) => setCssCode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`.header {
  display: flex;
  padding: 20px;
  background-color: #ffffff;
}

.nav {
  display: flex;
  gap: 16px;
}`}
                  className="font-mono text-xs min-h-[200px] resize-none"
                />
              </div>
            </TabsContent>
          </Tabs>

          <p className="text-xs text-muted-foreground">
            The component will be saved and appear in the Components folder in Code View.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim() || !htmlCode.trim()}>
            Create Component
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Helper to collect all styleSourceIds from an instance and its children
const collectStyleSourceIds = (instance: ComponentInstance): string[] => {
  const ids: string[] = [...(instance.styleSourceIds || [])];
  for (const child of instance.children || []) {
    ids.push(...collectStyleSourceIds(child));
  }
  return ids;
};
