import React from 'react';
import { Plus, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ColorPicker } from '../ColorPicker';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';
import { generateId } from '../../utils/instance';
import { Badge } from '@/components/ui/badge';

interface TabsDataEditorProps {
  instance: ComponentInstance;
}

export const TabsDataEditor: React.FC<TabsDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();
  
  // Get TabPanel children
  const tabPanels = instance.children?.filter(c => c.type === 'TabPanel') || [];
  const defaultTab = instance.props?.defaultTab || tabPanels[0]?.id || '';
  const orientation = instance.props?.orientation || 'horizontal';

  // Get current tabs style props with defaults
  const tabsStyles = instance.props?.tabsStyles || {
    listBackground: 'hsl(var(--muted))',
    listBorderRadius: '8',
    listPadding: '4',
    listGap: '4',
    listPosition: 'top',
    triggerBackground: 'transparent',
    triggerHoverBackground: 'hsl(var(--muted))',
    triggerActiveBackground: 'hsl(var(--background))',
    triggerTextColor: 'hsl(var(--muted-foreground))',
    triggerActiveTextColor: 'hsl(var(--foreground))',
    triggerPadding: '8',
    triggerBorderRadius: '6',
    triggerFontSize: '14',
    triggerFontWeight: '500',
    indicatorStyle: 'boxed',
    indicatorColor: 'hsl(var(--primary))',
    indicatorHeight: '2',
    contentBackground: 'transparent',
    contentPadding: '16',
    contentBorderRadius: '0',
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

  const addTabPanel = () => {
    const newPanelId = generateId();
    const newPanel: ComponentInstance = {
      id: newPanelId,
      type: 'TabPanel' as any,
      label: `Tab ${tabPanels.length + 1}`,
      props: { 
        label: `Tab ${tabPanels.length + 1}`, 
        content: `Content for Tab ${tabPanels.length + 1}` 
      },
      children: [],
      styleSourceIds: [],
    };
    
    updateInstance(instance.id, {
      children: [...(instance.children || []), newPanel]
    });
  };

  return (
    <div className="space-y-3">
      {/* Tab Panels Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-muted-foreground" />
            <label className="text-[10px] font-medium text-foreground">Tab Panels</label>
          </div>
          <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
            {tabPanels.length} tabs
          </Badge>
        </div>
        
        <p className="text-[9px] text-muted-foreground">
          Tab panels are managed via the Navigator tree. Select a TabPanel to edit its label and content.
        </p>
        
        <Button
          size="sm"
          variant="outline"
          onClick={addTabPanel}
          className="w-full h-6 text-[10px]"
        >
          <Plus className="w-3 h-3 mr-1" /> Add Tab Panel
        </Button>
      </div>

      <Separator />

      {/* Settings */}
      <div className="space-y-2">
        <label className="text-[10px] font-medium text-foreground">Tab Settings</label>
        
        <div className="space-y-1">
          <label className="text-[9px] text-muted-foreground">Orientation</label>
          <Select
            value={orientation}
            onValueChange={(val) => updateInstance(instance.id, {
              props: { ...instance.props, orientation: val }
            })}
          >
            <SelectTrigger className="h-5 text-[10px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="horizontal" className="text-[10px]">Horizontal</SelectItem>
              <SelectItem value="vertical" className="text-[10px]">Vertical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <label className="text-[9px] text-muted-foreground">Default Tab</label>
          <Select
            value={defaultTab}
            onValueChange={(val) => updateInstance(instance.id, {
              props: { ...instance.props, defaultTab: val }
            })}
          >
            <SelectTrigger className="h-5 text-[10px]">
              <SelectValue placeholder="Select default tab" />
            </SelectTrigger>
            <SelectContent>
              {tabPanels.map((panel, index) => (
                <SelectItem key={panel.id} value={panel.id} className="text-[10px]">
                  {panel.props?.label || `Tab ${index + 1}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
        
      <Separator />

      {/* Tabs Styling */}
      <div className="space-y-3">
        <Label className="text-[10px] font-medium text-foreground">Tab Bar</Label>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Position</Label>
            <Select 
              value={tabsStyles.listPosition} 
              onValueChange={(val) => updateTabsStyles({ listPosition: val })}
            >
              <SelectTrigger className="h-6 text-[10px] bg-muted text-foreground">
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
              <SelectTrigger className="h-6 text-[10px] bg-muted text-foreground">
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

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-[9px] text-muted-foreground">Bar Bg</Label>
            <ColorPicker
              value={tabsStyles.listBackground}
              onChange={(val) => updateTabsStyles({ listBackground: val })}
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
      </div>

      <Separator />

      {/* Tab Buttons */}
      <div className="space-y-3">
        <Label className="text-[10px] font-medium text-foreground">Tab Buttons</Label>
        
        <div className="grid grid-cols-2 gap-2">
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
          <div className="flex items-center justify-between">
            <Label className="text-[9px] text-muted-foreground">Active Bg</Label>
            <ColorPicker
              value={tabsStyles.triggerActiveBackground}
              onChange={(val) => updateTabsStyles({ triggerActiveBackground: val })}
            />
          </div>
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
            <Label className="text-[9px] text-muted-foreground">Font Size</Label>
            <Input
              type="number"
              value={tabsStyles.triggerFontSize}
              onChange={(e) => updateTabsStyles({ triggerFontSize: e.target.value })}
              className="h-6 text-[10px] bg-muted text-foreground"
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
              <SelectTrigger className="h-6 text-[10px] bg-muted text-foreground">
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

      {/* Content Panel */}
      <div className="space-y-3">
        <Label className="text-[10px] font-medium text-foreground">Content Panel</Label>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-[9px] text-muted-foreground">Background</Label>
            <ColorPicker
              value={tabsStyles.contentBackground}
              onChange={(val) => updateTabsStyles({ contentBackground: val })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Padding</Label>
            <Input
              type="number"
              value={tabsStyles.contentPadding}
              onChange={(e) => updateTabsStyles({ contentPadding: e.target.value })}
              className="h-6 text-[10px] bg-muted text-foreground"
              min="0"
              max="64"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-[9px] text-muted-foreground">Animation Duration (ms)</Label>
          <Input
            type="number"
            value={tabsStyles.animationDuration}
            onChange={(e) => updateTabsStyles({ animationDuration: e.target.value })}
            className="h-6 text-[10px] bg-muted text-foreground"
            min="0"
            max="1000"
            step="50"
          />
        </div>
      </div>
    </div>
  );
};
