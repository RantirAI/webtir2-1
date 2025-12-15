import React from 'react';
import { Plus, X, GripVertical, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const currentTemplate = instance.props?.breadcrumbStyles?.template || '';

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
