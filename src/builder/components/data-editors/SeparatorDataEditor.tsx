import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';
import { useStyleStore } from '../../store/useStyleStore';
import { Minus, MoreVertical } from 'lucide-react';

interface SeparatorSettings {
  orientation: 'horizontal' | 'vertical';
  lineType: 'solid' | 'dashed' | 'dotted' | 'double';
  thickness: string;
  length: string;
  spacing: string;
  decorative: boolean;
}

interface SeparatorDataEditorProps {
  instance: ComponentInstance;
}

const presetTemplates = [
  { value: 'simple-line', label: 'Simple Line' },
  { value: 'thick-divider', label: 'Thick Divider' },
  { value: 'dashed-line', label: 'Dashed Line' },
  { value: 'dotted-line', label: 'Dotted Line' },
  { value: 'double-line', label: 'Double Line' },
];

const templateSettings: Record<string, Partial<SeparatorSettings>> = {
  'simple-line': {
    orientation: 'horizontal',
    lineType: 'solid',
    thickness: '1px',
    length: '100%',
    spacing: '16px',
  },
  'thick-divider': {
    orientation: 'horizontal',
    lineType: 'solid',
    thickness: '3px',
    length: '100%',
    spacing: '24px',
  },
  'dashed-line': {
    orientation: 'horizontal',
    lineType: 'dashed',
    thickness: '1px',
    length: '100%',
    spacing: '16px',
  },
  'dotted-line': {
    orientation: 'horizontal',
    lineType: 'dotted',
    thickness: '2px',
    length: '100%',
    spacing: '16px',
  },
  'double-line': {
    orientation: 'horizontal',
    lineType: 'double',
    thickness: '3px',
    length: '100%',
    spacing: '20px',
  },
};

export const SeparatorDataEditor: React.FC<SeparatorDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();
  const { setStyle, currentBreakpointId } = useStyleStore();

  const settings: SeparatorSettings = {
    orientation: instance.props?.separatorSettings?.orientation || 'horizontal',
    lineType: instance.props?.separatorSettings?.lineType || 'solid',
    thickness: instance.props?.separatorSettings?.thickness || '1px',
    length: instance.props?.separatorSettings?.length || '100%',
    spacing: instance.props?.separatorSettings?.spacing || '16px',
    decorative: instance.props?.separatorSettings?.decorative ?? true,
  };

  const currentTemplate = instance.props?.separatorSettings?.template || '';

  const updateSettings = (updates: Partial<SeparatorSettings>) => {
    const newSettings = { ...settings, ...updates };
    
    updateInstance(instance.id, {
      props: {
        ...instance.props,
        separatorSettings: { ...instance.props?.separatorSettings, ...updates },
        'aria-hidden': newSettings.decorative ? 'true' : undefined,
        role: newSettings.decorative ? 'presentation' : 'separator',
      }
    });

    // Apply styles based on settings
    const styleSourceId = instance.styleSourceIds?.[0];
    if (styleSourceId) {
      const isHorizontal = newSettings.orientation === 'horizontal';
      
      // Width and height based on orientation
      if (updates.orientation !== undefined || updates.length !== undefined || updates.thickness !== undefined) {
        setStyle(
          styleSourceId,
          'width',
          isHorizontal ? newSettings.length : newSettings.thickness,
          currentBreakpointId
        );
        setStyle(
          styleSourceId,
          'height',
          isHorizontal ? newSettings.thickness : newSettings.length,
          currentBreakpointId
        );
      }

      // Margin based on orientation and spacing
      if (updates.spacing !== undefined || updates.orientation !== undefined) {
        if (isHorizontal) {
          setStyle(styleSourceId, 'marginTop', newSettings.spacing, currentBreakpointId);
          setStyle(styleSourceId, 'marginBottom', newSettings.spacing, currentBreakpointId);
          setStyle(styleSourceId, 'marginLeft', '0px', currentBreakpointId);
          setStyle(styleSourceId, 'marginRight', '0px', currentBreakpointId);
        } else {
          setStyle(styleSourceId, 'marginLeft', newSettings.spacing, currentBreakpointId);
          setStyle(styleSourceId, 'marginRight', newSettings.spacing, currentBreakpointId);
          setStyle(styleSourceId, 'marginTop', '0px', currentBreakpointId);
          setStyle(styleSourceId, 'marginBottom', '0px', currentBreakpointId);
        }
      }

      // Border style for line type
      if (updates.lineType !== undefined || updates.thickness !== undefined) {
        const lineType = updates.lineType || newSettings.lineType;
        const thickness = updates.thickness || newSettings.thickness;
        
        if (lineType === 'solid') {
          // Use background for solid lines
          setStyle(styleSourceId, 'borderStyle', 'none', currentBreakpointId);
        } else {
          // Use border for dashed, dotted, double
          setStyle(styleSourceId, 'backgroundColor', 'transparent', currentBreakpointId);
          setStyle(
            styleSourceId,
            isHorizontal ? 'borderTopStyle' : 'borderLeftStyle',
            lineType,
            currentBreakpointId
          );
          setStyle(
            styleSourceId,
            isHorizontal ? 'borderTopWidth' : 'borderLeftWidth',
            thickness,
            currentBreakpointId
          );
          setStyle(
            styleSourceId,
            isHorizontal ? 'borderTopColor' : 'borderLeftColor',
            'hsl(var(--border))',
            currentBreakpointId
          );
          // Reset height for border-based separators
          setStyle(
            styleSourceId,
            isHorizontal ? 'height' : 'width',
            '0px',
            currentBreakpointId
          );
        }
      }
    }
  };

  const applyTemplate = (templateId: string) => {
    const templateConfig = templateSettings[templateId];
    if (templateConfig) {
      updateInstance(instance.id, {
        props: {
          ...instance.props,
          separatorSettings: { ...settings, ...templateConfig, template: templateId }
        }
      });

      // Apply all template styles
      const styleSourceId = instance.styleSourceIds?.[0];
      if (styleSourceId) {
        const isHorizontal = templateConfig.orientation === 'horizontal';
        
        setStyle(styleSourceId, 'width', isHorizontal ? templateConfig.length! : templateConfig.thickness!, currentBreakpointId);
        setStyle(styleSourceId, 'height', isHorizontal ? templateConfig.thickness! : templateConfig.length!, currentBreakpointId);
        
        if (templateConfig.lineType === 'solid') {
          setStyle(styleSourceId, 'backgroundColor', 'hsl(var(--border))', currentBreakpointId);
          setStyle(styleSourceId, 'borderStyle', 'none', currentBreakpointId);
        } else {
          setStyle(styleSourceId, 'backgroundColor', 'transparent', currentBreakpointId);
          setStyle(styleSourceId, isHorizontal ? 'borderTopStyle' : 'borderLeftStyle', templateConfig.lineType!, currentBreakpointId);
          setStyle(styleSourceId, isHorizontal ? 'borderTopWidth' : 'borderLeftWidth', templateConfig.thickness!, currentBreakpointId);
          setStyle(styleSourceId, isHorizontal ? 'borderTopColor' : 'borderLeftColor', 'hsl(var(--border))', currentBreakpointId);
          setStyle(styleSourceId, isHorizontal ? 'height' : 'width', '0px', currentBreakpointId);
        }
        
        if (isHorizontal) {
          setStyle(styleSourceId, 'marginTop', templateConfig.spacing!, currentBreakpointId);
          setStyle(styleSourceId, 'marginBottom', templateConfig.spacing!, currentBreakpointId);
        } else {
          setStyle(styleSourceId, 'marginLeft', templateConfig.spacing!, currentBreakpointId);
          setStyle(styleSourceId, 'marginRight', templateConfig.spacing!, currentBreakpointId);
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Template Selection */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Preset</Label>
        <Select value={currentTemplate} onValueChange={applyTemplate}>
          <SelectTrigger className="h-7 text-[11px] bg-background border-border">
            <SelectValue placeholder="Choose a preset..." />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-50">
            {presetTemplates.map(template => (
              <SelectItem key={template.value} value={template.value} className="text-[11px]">
                {template.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orientation */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Orientation</Label>
        <ToggleGroup
          type="single"
          value={settings.orientation}
          onValueChange={(value) => value && updateSettings({ orientation: value as 'horizontal' | 'vertical' })}
          className="justify-start"
        >
          <ToggleGroupItem value="horizontal" className="h-7 px-3 text-[10px] gap-1.5">
            <Minus className="w-3 h-3" />
            Horizontal
          </ToggleGroupItem>
          <ToggleGroupItem value="vertical" className="h-7 px-3 text-[10px] gap-1.5">
            <MoreVertical className="w-3 h-3" />
            Vertical
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Line Style */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Line Style</Label>
        <Select
          value={settings.lineType}
          onValueChange={(value) => updateSettings({ lineType: value as SeparatorSettings['lineType'] })}
        >
          <SelectTrigger className="h-7 text-[11px] bg-background border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-50">
            <SelectItem value="solid" className="text-[11px]">Solid</SelectItem>
            <SelectItem value="dashed" className="text-[11px]">Dashed</SelectItem>
            <SelectItem value="dotted" className="text-[11px]">Dotted</SelectItem>
            <SelectItem value="double" className="text-[11px]">Double</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Dimensions */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Dimensions</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Thickness</Label>
            <Input
              value={settings.thickness}
              onChange={(e) => updateSettings({ thickness: e.target.value })}
              className="h-6 text-[10px]"
              placeholder="1px"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Length</Label>
            <Input
              value={settings.length}
              onChange={(e) => updateSettings({ length: e.target.value })}
              className="h-6 text-[10px]"
              placeholder="100%"
            />
          </div>
        </div>
      </div>

      {/* Spacing */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Spacing</Label>
        <Input
          value={settings.spacing}
          onChange={(e) => updateSettings({ spacing: e.target.value })}
          className="h-7 text-[11px]"
          placeholder="16px"
        />
        <p className="text-[9px] text-muted-foreground">
          {settings.orientation === 'horizontal' ? 'Vertical margin (above/below)' : 'Horizontal margin (left/right)'}
        </p>
      </div>

      {/* Accessibility */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Accessibility</Label>
        <label className="flex items-center gap-2 text-[10px]">
          <Checkbox
            checked={settings.decorative}
            onCheckedChange={(checked) => updateSettings({ decorative: !!checked })}
            className="h-3.5 w-3.5"
          />
          Decorative separator
        </label>
        <p className="text-[9px] text-muted-foreground">
          {settings.decorative
            ? 'Hidden from screen readers (aria-hidden="true")'
            : 'Announced as separator to screen readers'}
        </p>
      </div>
    </div>
  );
};
