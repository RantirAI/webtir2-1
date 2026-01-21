import React from 'react';
import { Plus, X, GripVertical, Home, ChevronRight, Slash, ArrowRight, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbDataEditorProps {
  instance: ComponentInstance;
}

const prebuiltTemplates = [
  { value: 'simple-chevron', label: 'Simple Chevron' },
  { value: 'slash-dividers', label: 'Slash Dividers' },
  { value: 'arrow-trail', label: 'Arrow Trail' },
  { value: 'dotted-path', label: 'Dotted Path' },
  { value: 'pill-style', label: 'Pill Style' },
  { value: 'underline-active', label: 'Underline Active' },
];

const separatorTypes = [
  { value: 'chevron', label: 'Chevron (›)', icon: ChevronRight },
  { value: 'slash', label: 'Slash (/)', icon: Slash },
  { value: 'arrow', label: 'Arrow (→)', icon: ArrowRight },
  { value: 'dot', label: 'Dot (•)', icon: Circle },
  { value: 'custom', label: 'Custom', icon: null },
];

const hoverStyles = [
  { value: 'underline', label: 'Underline' },
  { value: 'color', label: 'Color Change' },
  { value: 'background', label: 'Background' },
];

const templateStyles: Record<string, any> = {
  'simple-chevron': {
    separatorType: 'chevron',
    gap: '8',
    textColor: 'hsl(var(--muted-foreground))',
    activeTextColor: 'hsl(var(--foreground))',
    hoverColor: 'hsl(var(--primary))',
    fontSize: '14',
    fontWeight: '400',
    backgroundColor: 'transparent',
    padding: '0',
    borderRadius: '0',
    hoverStyle: 'underline',
  },
  'slash-dividers': {
    separatorType: 'slash',
    gap: '12',
    textColor: 'hsl(var(--muted-foreground))',
    activeTextColor: 'hsl(var(--foreground))',
    hoverColor: 'hsl(var(--primary))',
    fontSize: '14',
    fontWeight: '500',
    backgroundColor: 'transparent',
    padding: '0',
    borderRadius: '0',
    hoverStyle: 'color',
  },
  'arrow-trail': {
    separatorType: 'arrow',
    gap: '10',
    textColor: 'hsl(var(--muted-foreground))',
    activeTextColor: 'hsl(var(--foreground))',
    hoverColor: 'hsl(var(--primary))',
    fontSize: '14',
    fontWeight: '400',
    backgroundColor: 'transparent',
    padding: '0',
    borderRadius: '0',
    hoverStyle: 'color',
  },
  'dotted-path': {
    separatorType: 'dot',
    gap: '8',
    textColor: 'hsl(var(--muted-foreground))',
    activeTextColor: 'hsl(var(--foreground))',
    hoverColor: 'hsl(var(--primary))',
    fontSize: '13',
    fontWeight: '400',
    backgroundColor: 'transparent',
    padding: '0',
    borderRadius: '0',
    separatorSize: '4',
    hoverStyle: 'underline',
  },
  'pill-style': {
    separatorType: 'chevron',
    gap: '4',
    textColor: 'hsl(var(--foreground))',
    activeTextColor: 'hsl(var(--primary-foreground))',
    hoverColor: 'hsl(var(--primary))',
    fontSize: '12',
    fontWeight: '500',
    backgroundColor: 'hsl(var(--muted))',
    activeBackgroundColor: 'hsl(var(--primary))',
    itemBackgroundColor: 'hsl(var(--muted))',
    padding: '4',
    itemPadding: '6 12',
    borderRadius: '9999',
    hoverStyle: 'background',
  },
  'underline-active': {
    separatorType: 'slash',
    gap: '16',
    textColor: 'hsl(var(--muted-foreground))',
    activeTextColor: 'hsl(var(--primary))',
    hoverColor: 'hsl(var(--primary))',
    fontSize: '14',
    fontWeight: '500',
    backgroundColor: 'transparent',
    padding: '0',
    borderRadius: '0',
    activeUnderline: true,
    hoverStyle: 'underline',
  },
};

export const BreadcrumbDataEditor: React.FC<BreadcrumbDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();
  const items: BreadcrumbItem[] = instance.props?.items || [
    { id: '1', label: 'Home', href: '/' },
    { id: '2', label: 'Products', href: '/products' },
    { id: '3', label: 'Current Page', isCurrentPage: true },
  ];

  const settings = instance.props?.breadcrumbSettings || {};
  const styles = instance.props?.breadcrumbStyles || {};
  const currentTemplate = styles.template || '';

  const updateItems = (newItems: BreadcrumbItem[]) => {
    updateInstance(instance.id, {
      props: { ...instance.props, items: newItems }
    });
  };

  const updateSettings = (key: string, value: any) => {
    updateInstance(instance.id, {
      props: {
        ...instance.props,
        breadcrumbSettings: { ...settings, [key]: value }
      }
    });
  };

  const updateStyles = (key: string, value: any) => {
    updateInstance(instance.id, {
      props: {
        ...instance.props,
        breadcrumbStyles: { ...styles, [key]: value }
      }
    });
  };

  const applyTemplate = (templateId: string) => {
    const templateStyle = templateStyles[templateId];
    if (templateStyle) {
      updateInstance(instance.id, {
        props: {
          ...instance.props,
          breadcrumbStyles: { ...instance.props?.breadcrumbStyles, ...templateStyle, template: templateId }
        }
      });
    }
  };

  const addItem = () => {
    const newItem: BreadcrumbItem = {
      id: Date.now().toString(),
      label: `Page ${items.length + 1}`,
      href: '#',
    };
    updateItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof BreadcrumbItem, value: string | boolean) => {
    const newItems = items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    updateItems(newItems);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    updateItems(items.filter(item => item.id !== id));
  };

  const [separatorOpen, setSeparatorOpen] = React.useState(false);
  const [appearanceOpen, setAppearanceOpen] = React.useState(false);
  const [textOpen, setTextOpen] = React.useState(false);
  const [seoOpen, setSeoOpen] = React.useState(false);

  return (
    <div className="space-y-4">
      {/* Template Selection */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Template</Label>
        <Select value={currentTemplate} onValueChange={applyTemplate}>
          <SelectTrigger className="h-7 text-[11px] bg-background border-border">
            <SelectValue placeholder="Choose a template..." />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-50">
            {prebuiltTemplates.map(template => (
              <SelectItem key={template.value} value={template.value} className="text-[11px]">
                {template.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Settings */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Settings</Label>
        
        <label className="flex items-center gap-2 text-[10px]">
          <Checkbox
            checked={settings.showHomeIcon || false}
            onCheckedChange={(checked) => updateSettings('showHomeIcon', !!checked)}
            className="h-3.5 w-3.5"
          />
          <Home className="w-3 h-3 text-muted-foreground" />
          Show home icon on first item
        </label>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Max Items</Label>
            <Input
              type="number"
              value={settings.maxItems || ''}
              onChange={(e) => updateSettings('maxItems', e.target.value ? parseInt(e.target.value) : null)}
              className="h-6 text-[10px]"
              placeholder="No limit"
              min={2}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Collapsed Label</Label>
            <Input
              value={settings.collapsedLabel || '...'}
              onChange={(e) => updateSettings('collapsedLabel', e.target.value)}
              className="h-6 text-[10px]"
              placeholder="..."
            />
          </div>
        </div>
      </div>

      {/* Separator Configuration */}
      <Collapsible open={separatorOpen} onOpenChange={setSeparatorOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-1.5 text-[10px] font-medium text-foreground hover:text-foreground/80">
          Separator Configuration
          <ChevronRight className={`w-3 h-3 transition-transform ${separatorOpen ? 'rotate-90' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Separator Type</Label>
            <Select
              value={styles.separatorType || 'chevron'}
              onValueChange={(value) => updateStyles('separatorType', value)}
            >
              <SelectTrigger className="h-6 text-[10px] bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                {separatorTypes.map(type => (
                  <SelectItem key={type.value} value={type.value} className="text-[10px]">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {styles.separatorType === 'custom' && (
            <div className="space-y-1">
              <Label className="text-[9px] text-muted-foreground">Custom Separator</Label>
              <Input
                value={styles.customSeparator || ''}
                onChange={(e) => updateStyles('customSeparator', e.target.value)}
                className="h-5 text-[10px]"
                placeholder="Enter character..."
                maxLength={3}
              />
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Separator Size</Label>
            <Input
              type="number"
              value={styles.separatorSize || '14'}
              onChange={(e) => updateStyles('separatorSize', e.target.value)}
              className="h-5 text-[10px]"
              placeholder="14"
              min={8}
              max={24}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Appearance Settings */}
      <Collapsible open={appearanceOpen} onOpenChange={setAppearanceOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-1.5 text-[10px] font-medium text-foreground hover:text-foreground/80">
          Appearance
          <ChevronRight className={`w-3 h-3 transition-transform ${appearanceOpen ? 'rotate-90' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Item Spacing</Label>
            <Input
              value={styles.gap || '8'}
              onChange={(e) => updateStyles('gap', e.target.value)}
              className="h-5 text-[10px]"
              placeholder="8"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Hover Style</Label>
            <Select
              value={styles.hoverStyle || 'underline'}
              onValueChange={(value) => updateStyles('hoverStyle', value)}
            >
              <SelectTrigger className="h-6 text-[10px] bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                {hoverStyles.map(style => (
                  <SelectItem key={style.value} value={style.value} className="text-[10px]">
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Text Options */}
      <Collapsible open={textOpen} onOpenChange={setTextOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-1.5 text-[10px] font-medium text-foreground hover:text-foreground/80">
          Text Options
          <ChevronRight className={`w-3 h-3 transition-transform ${textOpen ? 'rotate-90' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <label className="flex items-center gap-2 text-[10px]">
            <Checkbox
              checked={settings.truncateLabels || false}
              onCheckedChange={(checked) => updateSettings('truncateLabels', !!checked)}
              className="h-3.5 w-3.5"
            />
            Truncate long labels
          </label>

          {settings.truncateLabels && (
            <div className="space-y-1">
              <Label className="text-[9px] text-muted-foreground">Max Label Length</Label>
              <Input
                type="number"
                value={settings.maxLabelLength || 20}
                onChange={(e) => updateSettings('maxLabelLength', parseInt(e.target.value) || 20)}
                className="h-5 text-[10px]"
                placeholder="20"
                min={5}
                max={100}
              />
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* SEO & Accessibility */}
      <Collapsible open={seoOpen} onOpenChange={setSeoOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-1.5 text-[10px] font-medium text-foreground hover:text-foreground/80">
          SEO & Accessibility
          <ChevronRight className={`w-3 h-3 transition-transform ${seoOpen ? 'rotate-90' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <label className="flex items-center gap-2 text-[10px]">
            <Checkbox
              checked={settings.enableStructuredData || false}
              onCheckedChange={(checked) => updateSettings('enableStructuredData', !!checked)}
              className="h-3.5 w-3.5"
            />
            Enable structured data (JSON-LD)
          </label>
          <p className="text-[9px] text-muted-foreground pl-5">
            Adds schema.org BreadcrumbList for better SEO
          </p>
        </CollapsibleContent>
      </Collapsible>

      {/* Items */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-medium text-foreground">Breadcrumb Items</Label>
          <Button
            size="sm"
            variant="ghost"
            onClick={addItem}
            className="h-5 px-1.5 text-[9px]"
          >
            <Plus className="w-3 h-3 mr-0.5" /> Add
          </Button>
        </div>
        
        <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
          {items.map((item, index) => (
            <div key={item.id} className="p-2 border border-border rounded bg-muted/30 space-y-2">
              <div className="flex items-center gap-1">
                <GripVertical className="w-3 h-3 text-muted-foreground cursor-grab" />
                <span className="flex-1 text-[10px] font-medium">Item {index + 1}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeItem(item.id)}
                  className="h-4 w-4 p-0 text-destructive hover:text-destructive"
                  disabled={items.length <= 1}
                >
                  <X className="w-2.5 h-2.5" />
                </Button>
              </div>
              
              <div className="space-y-1">
                <Label className="text-[9px] text-muted-foreground">Label</Label>
                <Input
                  value={item.label}
                  onChange={(e) => updateItem(item.id, 'label', e.target.value)}
                  className="h-5 text-[10px]"
                  placeholder="Page name"
                />
              </div>
              
              {!item.isCurrentPage && (
                <div className="space-y-1">
                  <Label className="text-[9px] text-muted-foreground">URL</Label>
                  <Input
                    value={item.href || ''}
                    onChange={(e) => updateItem(item.id, 'href', e.target.value)}
                    className="h-5 text-[10px]"
                    placeholder="/page-path"
                  />
                </div>
              )}
              
              <label className="flex items-center gap-1.5 text-[9px]">
                <Checkbox
                  checked={item.isCurrentPage || false}
                  onCheckedChange={(checked) => {
                    // Only one can be current page
                    const newItems = items.map(i => ({
                      ...i,
                      isCurrentPage: i.id === item.id ? !!checked : false
                    }));
                    updateItems(newItems);
                  }}
                  className="h-3 w-3"
                />
                Current page (no link)
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
