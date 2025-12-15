import React from 'react';
import { ChevronRight, Slash, ArrowRight, Circle, Minus, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColorPicker } from '../ColorPicker';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface BreadcrumbStyleEditorProps {
  instance: ComponentInstance;
}

const separatorIcons = [
  { value: 'chevron', label: 'Chevron', icon: ChevronRight },
  { value: 'slash', label: 'Slash', icon: Slash },
  { value: 'arrow', label: 'Arrow', icon: ArrowRight },
  { value: 'dot', label: 'Dot', icon: Circle },
  { value: 'dash', label: 'Dash', icon: Minus },
];

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

export const BreadcrumbStyleEditor: React.FC<BreadcrumbStyleEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();
  const styles = instance.props?.breadcrumbStyles || {};

  const updateStyles = (key: string, value: string | boolean) => {
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
          breadcrumbStyles: { ...styles, ...templateStyle, template: templateId }
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Template Selection */}
      <div className="space-y-1.5">
        <Label className="text-[10px] text-muted-foreground">Template</Label>
        <Select value={styles.template || ''} onValueChange={applyTemplate}>
          <SelectTrigger className="h-7 text-[11px] bg-muted">
            <SelectValue placeholder="Choose template..." />
          </SelectTrigger>
          <SelectContent>
            {prebuiltTemplates.map(template => (
              <SelectItem key={template.value} value={template.value} className="text-[11px]">
                {template.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Layout */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Layout</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Orientation</Label>
            <Select value={styles.orientation || 'horizontal'} onValueChange={(v) => updateStyles('orientation', v)}>
              <SelectTrigger className="h-6 text-[10px] bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="horizontal" className="text-[10px]">Horizontal</SelectItem>
                <SelectItem value="vertical" className="text-[10px]">Vertical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Gap (px)</Label>
            <Input
              type="number"
              value={styles.gap || '8'}
              onChange={(e) => updateStyles('gap', e.target.value)}
              className="h-6 text-[10px] bg-muted"
            />
          </div>
        </div>
      </div>

      {/* Item Styling */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Item Styling</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Text Color</Label>
            <ColorPicker
              value={styles.textColor || ''}
              onChange={(v) => updateStyles('textColor', v)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Active Color</Label>
            <ColorPicker
              value={styles.activeTextColor || ''}
              onChange={(v) => updateStyles('activeTextColor', v)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Hover Color</Label>
            <ColorPicker
              value={styles.hoverColor || ''}
              onChange={(v) => updateStyles('hoverColor', v)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Font Size (px)</Label>
            <Input
              type="number"
              value={styles.fontSize || '14'}
              onChange={(e) => updateStyles('fontSize', e.target.value)}
              className="h-6 text-[10px] bg-muted"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Font Weight</Label>
            <Select value={styles.fontWeight || '400'} onValueChange={(v) => updateStyles('fontWeight', v)}>
              <SelectTrigger className="h-6 text-[10px] bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="400" className="text-[10px]">Normal</SelectItem>
                <SelectItem value="500" className="text-[10px]">Medium</SelectItem>
                <SelectItem value="600" className="text-[10px]">Semibold</SelectItem>
                <SelectItem value="700" className="text-[10px]">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Item BG Color</Label>
            <ColorPicker
              value={styles.itemBackgroundColor || ''}
              onChange={(v) => updateStyles('itemBackgroundColor', v)}
            />
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Separator</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Type</Label>
            <Select value={styles.separatorType || 'chevron'} onValueChange={(v) => updateStyles('separatorType', v)}>
              <SelectTrigger className="h-6 text-[10px] bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {separatorIcons.map(sep => (
                  <SelectItem key={sep.value} value={sep.value} className="text-[10px]">
                    <span className="flex items-center gap-1.5">
                      <sep.icon className="w-3 h-3" />
                      {sep.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Size (px)</Label>
            <Input
              type="number"
              value={styles.separatorSize || '14'}
              onChange={(e) => updateStyles('separatorSize', e.target.value)}
              className="h-6 text-[10px] bg-muted"
            />
          </div>
          <div className="col-span-2 space-y-1">
            <Label className="text-[9px] text-muted-foreground">Separator Color</Label>
            <ColorPicker
              value={styles.separatorColor || ''}
              onChange={(v) => updateStyles('separatorColor', v)}
            />
          </div>
        </div>
      </div>

      {/* Container */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Container</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Background</Label>
            <ColorPicker
              value={styles.backgroundColor || ''}
              onChange={(v) => updateStyles('backgroundColor', v)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Padding (px)</Label>
            <Input
              type="text"
              value={styles.padding || '0'}
              onChange={(e) => updateStyles('padding', e.target.value)}
              className="h-6 text-[10px] bg-muted"
              placeholder="8 or 8 16"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Border Radius (px)</Label>
            <Input
              type="text"
              value={styles.borderRadius || '0'}
              onChange={(e) => updateStyles('borderRadius', e.target.value)}
              className="h-6 text-[10px] bg-muted"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
