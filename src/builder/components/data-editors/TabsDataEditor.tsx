import React from 'react';
import { Plus, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

  const updateTabs = (newTabs: TabItem[]) => {
    updateInstance(instance.id, {
      props: { ...instance.props, tabs: newTabs }
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
        
        <div className="space-y-2 max-h-[250px] overflow-y-auto">
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
    </div>
  );
};
