import React from 'react';
import { Plus, X, GripVertical, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ColorPicker } from '../ColorPicker';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface TabItem {
  id: string;
  label: string;
  content: string;
  disabled?: boolean;
}

interface TabsDataEditorProps {
  instance: ComponentInstance;
}

export const TabsDataEditor: React.FC<TabsDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();
  const tabs: TabItem[] = instance.props?.tabs || [
    { id: 'overview', label: 'Overview', content: 'Get a quick summary of your account activity and recent updates.' },
    { id: 'analytics', label: 'Analytics', content: 'View detailed metrics and performance insights for your data.' },
    { id: 'settings', label: 'Settings', content: 'Manage your preferences and configuration options.' },
  ];

  const defaultTab = instance.props?.defaultTab || tabs[0]?.id;
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

  const updateTabs = (newTabs: TabItem[]) => {
    updateInstance(instance.id, {
      props: { ...instance.props, tabs: newTabs }
    });
  };

  const updateTabsStyles = (updates: Partial<typeof tabsStyles>) => {
    updateInstance(instance.id, {
      props: {
        ...instance.props,
        tabsStyles: { ...tabsStyles, ...updates }
      }
    });
  };

  const addTab = () => {
    const newTab: TabItem = {
      id: `tab-${Date.now()}`,
      label: `Tab ${tabs.length + 1}`,
      content: `Content for Tab ${tabs.length + 1}`,
    };
    updateTabs([...tabs, newTab]);
  };

  const updateTab = (id: string, field: keyof TabItem, value: string | boolean) => {
    const newTabs = tabs.map(tab =>
      tab.id === id ? { ...tab, [field]: value } : tab
    );
    updateTabs(newTabs);
  };

  const removeTab = (id: string) => {
    if (tabs.length <= 1) return;
    const newTabs = tabs.filter(tab => tab.id !== id);
    updateTabs(newTabs);
    // Update default if removed
    if (defaultTab === id && newTabs.length > 0) {
      updateInstance(instance.id, {
        props: { ...instance.props, tabs: newTabs, defaultTab: newTabs[0].id }
      });
    }
  };

  return (
    <div className="space-y-3">
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
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tabs.map(tab => (
                <SelectItem key={tab.id} value={tab.id} className="text-[10px]">
                  {tab.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-medium text-foreground">Tabs</label>
          <Button
            size="sm"
            variant="ghost"
            onClick={addTab}
            className="h-5 px-1.5 text-[9px]"
          >
            <Plus className="w-3 h-3 mr-0.5" /> Add
          </Button>
        </div>
        
        <div className="space-y-2 max-h-[180px] overflow-y-auto">
          {tabs.map((tab, index) => (
            <div key={tab.id} className="p-2 border border-border rounded bg-muted/30 space-y-2">
              <div className="flex items-center gap-1">
                <GripVertical className="w-3 h-3 text-muted-foreground cursor-grab" />
                <span className="flex-1 text-[10px] font-medium">Tab {index + 1}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeTab(tab.id)}
                  className="h-4 w-4 p-0 text-destructive hover:text-destructive"
                  disabled={tabs.length <= 1}
                >
                  <X className="w-2.5 h-2.5" />
                </Button>
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] text-muted-foreground">Label</label>
                <Input
                  value={tab.label}
                  onChange={(e) => updateTab(tab.id, 'label', e.target.value)}
                  className="h-5 text-[10px]"
                  placeholder="Tab label"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] text-muted-foreground">Content</label>
                <Textarea
                  value={tab.content}
                  onChange={(e) => updateTab(tab.id, 'content', e.target.value)}
                  className="text-[10px] min-h-[50px] resize-none"
                  placeholder="Tab content..."
                />
              </div>
              
              <label className="flex items-center gap-1.5 text-[9px]">
                <input
                  type="checkbox"
                  checked={tab.disabled || false}
                  onChange={(e) => updateTab(tab.id, 'disabled', e.target.checked)}
                  className="w-3 h-3"
                />
                Disabled
              </label>
            </div>
          ))}
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
