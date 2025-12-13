import React from 'react';
import { Input } from '@/components/ui/input';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface AvatarDataEditorProps {
  instance: ComponentInstance;
}

export const AvatarDataEditor: React.FC<AvatarDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  const updateProps = (updates: Record<string, any>) => {
    updateInstance(instance.id, {
      props: { ...instance.props, ...updates }
    });
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-medium text-foreground">Avatar Settings</label>
      
      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Image URL</label>
        <Input
          value={instance.props?.src || ''}
          onChange={(e) => updateProps({ src: e.target.value })}
          className="h-5 text-[10px]"
          placeholder="https://example.com/avatar.jpg"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Fallback Initials</label>
        <Input
          value={instance.props?.fallback || 'CN'}
          onChange={(e) => updateProps({ fallback: e.target.value.slice(0, 2).toUpperCase() })}
          className="h-5 text-[10px] w-16"
          placeholder="CN"
          maxLength={2}
        />
      </div>

      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Alt Text</label>
        <Input
          value={instance.props?.alt || 'User avatar'}
          onChange={(e) => updateProps({ alt: e.target.value })}
          className="h-5 text-[10px]"
          placeholder="User avatar"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Size</label>
        <select
          className="w-full h-5 px-1 text-[10px] rounded border border-border bg-background"
          value={instance.props?.size || 'md'}
          onChange={(e) => updateProps({ size: e.target.value })}
        >
          <option value="sm">Small (32px)</option>
          <option value="md">Medium (40px)</option>
          <option value="lg">Large (48px)</option>
          <option value="xl">Extra Large (64px)</option>
        </select>
      </div>
    </div>
  );
};
