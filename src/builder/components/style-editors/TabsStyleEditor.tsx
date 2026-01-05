import React from 'react';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ColorPicker } from '../ColorPicker';
import { AlignLeft, AlignCenter, AlignRight, ArrowDown, ArrowUp, ArrowLeft, ArrowRight } from 'lucide-react';

interface TabsStyleEditorProps {
  instance: ComponentInstance;
}

export const TabsStyleEditor: React.FC<TabsStyleEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();
  
  // Get current tabs style props with defaults
  const tabsStyles = instance.props?.tabsStyles || {
    // Tab List
    listBackground: 'hsl(var(--muted))',
    listBorderRadius: '8',
    listPadding: '4',
    listGap: '4',
    listPosition: 'top',
    
    // Tab Trigger
    triggerBackground: 'transparent',
    triggerHoverBackground: 'hsl(var(--muted))',
    triggerActiveBackground: 'hsl(var(--background))',
    triggerTextColor: 'hsl(var(--muted-foreground))',
    triggerActiveTextColor: 'hsl(var(--foreground))',
    triggerPadding: '8',
    triggerBorderRadius: '6',
    triggerFontSize: '14',
    triggerFontWeight: '500',
    
    // Indicator
    indicatorStyle: 'boxed',
    indicatorColor: 'hsl(var(--primary))',
    indicatorHeight: '2',
    
    // Content
    contentBackground: 'transparent',
    contentPadding: '16',
    contentBorderRadius: '0',
    
    // Animation
    animationDuration: '200',
  };

  const updateTabsStyles = (updates: Partial<typeof tabsStyles>) => {
    updateInstance(instance.id, {
      props: {
        ...instance.props,
        tabsStyles: { ...tabsStyles, ...updates }
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Tab List Position */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Layout</Label>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Position</Label>
            <Select 
              value={tabsStyles.listPosition} 
              onValueChange={(val) => updateTabsStyles({ listPosition: val })}
            >
              <SelectTrigger className="h-7 text-[10px] bg-[hsl(var(--muted))] text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">
                  <span className="flex items-center gap-1.5">
                    <ArrowUp className="w-3 h-3" /> Top
                  </span>
                </SelectItem>
                <SelectItem value="bottom">
                  <span className="flex items-center gap-1.5">
                    <ArrowDown className="w-3 h-3" /> Bottom
                  </span>
                </SelectItem>
                <SelectItem value="left">
                  <span className="flex items-center gap-1.5">
                    <ArrowLeft className="w-3 h-3" /> Left
                  </span>
                </SelectItem>
                <SelectItem value="right">
                  <span className="flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3" /> Right
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Indicator Style</Label>
            <Select 
              value={tabsStyles.indicatorStyle} 
              onValueChange={(val) => updateTabsStyles({ indicatorStyle: val })}
            >
              <SelectTrigger className="h-7 text-[10px] bg-[hsl(var(--muted))] text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="underline">Underline</SelectItem>
                <SelectItem value="pill">Pill</SelectItem>
                <SelectItem value="boxed">Boxed</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Tab List Styling */}
      <div className="space-y-3">
        <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Tab Bar</Label>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between">
            <Label className="text-[9px] text-muted-foreground">Background</Label>
            <ColorPicker
              value={tabsStyles.listBackground}
              onChange={(val) => updateTabsStyles({ listBackground: val })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Border Radius</Label>
            <Input
              type="number"
              value={tabsStyles.listBorderRadius}
              onChange={(e) => updateTabsStyles({ listBorderRadius: e.target.value })}
              className="h-7 text-[10px] bg-muted text-foreground w-full px-2"
              min="0"
              max="32"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Padding (px)</Label>
            <Input
              type="number"
              value={tabsStyles.listPadding}
              onChange={(e) => updateTabsStyles({ listPadding: e.target.value })}
              className="h-7 text-[10px] bg-muted text-foreground w-full px-2"
              min="0"
              max="32"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Gap (px)</Label>
            <Input
              type="number"
              value={tabsStyles.listGap}
              onChange={(e) => updateTabsStyles({ listGap: e.target.value })}
              className="h-7 text-[10px] bg-muted text-foreground w-full px-2"
              min="0"
              max="32"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Tab Trigger Styling */}
      <div className="space-y-3">
        <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Tab Buttons</Label>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between">
            <Label className="text-[9px] text-muted-foreground">Background</Label>
            <ColorPicker
              value={tabsStyles.triggerBackground}
              onChange={(val) => updateTabsStyles({ triggerBackground: val })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[9px] text-muted-foreground">Hover Bg</Label>
            <ColorPicker
              value={tabsStyles.triggerHoverBackground}
              onChange={(val) => updateTabsStyles({ triggerHoverBackground: val })}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between">
            <Label className="text-[9px] text-muted-foreground">Active Bg</Label>
            <ColorPicker
              value={tabsStyles.triggerActiveBackground}
              onChange={(val) => updateTabsStyles({ triggerActiveBackground: val })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[9px] text-muted-foreground">Indicator</Label>
            <ColorPicker
              value={tabsStyles.indicatorColor}
              onChange={(val) => updateTabsStyles({ indicatorColor: val })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between">
            <Label className="text-[9px] text-muted-foreground">Text Color</Label>
            <ColorPicker
              value={tabsStyles.triggerTextColor}
              onChange={(val) => updateTabsStyles({ triggerTextColor: val })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[9px] text-muted-foreground">Active Text</Label>
            <ColorPicker
              value={tabsStyles.triggerActiveTextColor}
              onChange={(val) => updateTabsStyles({ triggerActiveTextColor: val })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Padding (px)</Label>
            <Input
              type="number"
              value={tabsStyles.triggerPadding}
              onChange={(e) => updateTabsStyles({ triggerPadding: e.target.value })}
              className="h-7 text-[10px] bg-muted text-foreground w-full px-2"
              min="0"
              max="32"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Border Radius</Label>
            <Input
              type="number"
              value={tabsStyles.triggerBorderRadius}
              onChange={(e) => updateTabsStyles({ triggerBorderRadius: e.target.value })}
              className="h-7 text-[10px] bg-muted text-foreground w-full px-2"
              min="0"
              max="32"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Font Size (px)</Label>
            <Input
              type="number"
              value={tabsStyles.triggerFontSize}
              onChange={(e) => updateTabsStyles({ triggerFontSize: e.target.value })}
              className="h-7 text-[10px] bg-muted text-foreground w-full px-2"
              min="10"
              max="24"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Font Weight</Label>
            <Select 
              value={tabsStyles.triggerFontWeight} 
              onValueChange={(val) => updateTabsStyles({ triggerFontWeight: val })}
            >
              <SelectTrigger className="h-7 text-[10px] bg-[hsl(var(--muted))] text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="400">Regular</SelectItem>
                <SelectItem value="500">Medium</SelectItem>
                <SelectItem value="600">Semibold</SelectItem>
                <SelectItem value="700">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Content Panel Styling */}
      <div className="space-y-3">
        <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Content Panel</Label>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between">
            <Label className="text-[9px] text-muted-foreground">Background</Label>
            <ColorPicker
              value={tabsStyles.contentBackground}
              onChange={(val) => updateTabsStyles({ contentBackground: val })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Padding (px)</Label>
            <Input
              type="number"
              value={tabsStyles.contentPadding}
              onChange={(e) => updateTabsStyles({ contentPadding: e.target.value })}
              className="h-7 text-[10px] bg-muted text-foreground w-full px-2"
              min="0"
              max="64"
            />
          </div>
        </div>
        
        <div className="space-y-1">
          <Label className="text-[9px] text-muted-foreground">Border Radius (px)</Label>
          <Input
            type="number"
            value={tabsStyles.contentBorderRadius}
            onChange={(e) => updateTabsStyles({ contentBorderRadius: e.target.value })}
            className="h-7 text-[10px] bg-muted text-foreground w-full px-2"
            min="0"
            max="32"
          />
        </div>
      </div>

      <Separator />

      {/* Animation */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Animation</Label>
        
        <div className="space-y-1">
          <Label className="text-[9px] text-muted-foreground">Duration (ms)</Label>
          <Input
            type="number"
            value={tabsStyles.animationDuration}
            onChange={(e) => updateTabsStyles({ animationDuration: e.target.value })}
            className="h-7 text-[10px] bg-muted text-foreground w-full px-2"
            min="0"
            max="1000"
            step="50"
          />
        </div>
      </div>
    </div>
  );
};
