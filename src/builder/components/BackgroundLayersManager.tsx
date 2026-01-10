import React, { useState, useEffect } from 'react';
import { Plus, X, GripVertical, Paintbrush, Image as ImageIcon, Layers, Scissors } from 'lucide-react';
import { ColorPicker } from './ColorPicker';
import { GradientPicker } from './GradientPicker';
import { ImageUpload } from './ImageUpload';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type BackgroundLayerType = 'fill' | 'gradient' | 'media';

export interface BackgroundLayerItem {
  id: string;
  type: BackgroundLayerType;
  value: string;
  // For media layers
  size?: string;
  position?: string;
  repeat?: string;
}

interface BackgroundLayersManagerProps {
  layers: BackgroundLayerItem[];
  onChange: (layers: BackgroundLayerItem[]) => void;
  backgroundClip?: string;
  onBackgroundClipChange?: (value: string) => void;
  getPropertyColorClass?: (property: string) => string;
}

interface SortableLayerProps {
  layer: BackgroundLayerItem;
  onUpdate: (id: string, updates: Partial<BackgroundLayerItem>) => void;
  onRemove: (id: string) => void;
  getPropertyColorClass?: (property: string) => string;
}

const SortableLayer: React.FC<SortableLayerProps> = ({ layer, onUpdate, onRemove, getPropertyColorClass }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: layer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getLayerIcon = () => {
    switch (layer.type) {
      case 'fill':
        return <Paintbrush className="w-3.5 h-3.5" />;
      case 'gradient':
        return <Layers className="w-3.5 h-3.5" />;
      case 'media':
        return <ImageIcon className="w-3.5 h-3.5" />;
    }
  };

  const getLayerLabel = () => {
    switch (layer.type) {
      case 'fill':
        return 'FILL';
      case 'gradient':
        return 'GRADIENT';
      case 'media':
        return 'IMAGE';
    }
  };

  const getDisplayValue = () => {
    if (layer.type === 'fill') {
      return layer.value || 'transparent';
    }
    if (layer.type === 'gradient') {
      return 'Gradient';
    }
    if (layer.type === 'media') {
      const urlMatch = layer.value?.match(/url\(['"]?(.+?)['"]?\)/);
      if (urlMatch) {
        const url = urlMatch[1];
        return url.length > 18 ? url.substring(0, 18) + '...' : url;
      }
      return 'None';
    }
    return '';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 bg-background border border-border rounded-md mb-2"
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-0.5 text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>

      {/* Layer Icon and Type */}
      <div className="flex items-center gap-2 min-w-[70px]">
        <span className="text-muted-foreground">{getLayerIcon()}</span>
        <span className="text-[10px] font-medium text-foreground uppercase tracking-wide">
          {getLayerLabel()}
        </span>
      </div>

      {/* Layer Controls */}
      <div className="flex-1 flex items-center gap-2">
        {layer.type === 'fill' && (
          <>
            <ColorPicker
              value={layer.value || 'transparent'}
              onChange={(val) => onUpdate(layer.id, { value: val })}
            />
            <span className="text-[9px] text-muted-foreground font-mono truncate max-w-[80px]">
              {layer.value || 'transparent'}
            </span>
          </>
        )}

        {layer.type === 'gradient' && (
          <>
            <GradientPicker
              value={layer.value || ''}
              onChange={(val) => onUpdate(layer.id, { value: val })}
            />
            <span className="text-[9px] text-muted-foreground truncate max-w-[80px]">
              {layer.value ? 'Gradient' : 'None'}
            </span>
          </>
        )}

        {layer.type === 'media' && (
          <>
            <ImageUpload
              currentValue={layer.value?.match(/url\(['"]?(.+?)['"]?\)/)?.[1] || ''}
              onImageChange={(url) => {
                if (url) {
                  onUpdate(layer.id, { 
                    value: `url(${url})`,
                    size: layer.size || 'cover',
                    position: layer.position || 'center',
                    repeat: layer.repeat || 'no-repeat',
                  });
                } else {
                  onUpdate(layer.id, { value: '' });
                }
              }}
              mode="background"
              compact
            />
            <span className="text-[9px] text-muted-foreground truncate max-w-[80px]">
              {getDisplayValue()}
            </span>
          </>
        )}
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(layer.id)}
        className="p-1 text-muted-foreground hover:text-destructive rounded hover:bg-destructive/10 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// Expanded layer options component
const LayerOptions: React.FC<{
  layer: BackgroundLayerItem;
  onUpdate: (id: string, updates: Partial<BackgroundLayerItem>) => void;
  getPropertyColorClass?: (property: string) => string;
}> = ({ layer, onUpdate, getPropertyColorClass }) => {
  if (layer.type !== 'media' || !layer.value) return null;

  return (
    <div className="ml-6 mb-2 p-2 bg-muted/30 rounded-md border border-border/50">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={`text-[9px] text-muted-foreground mb-1 block ${getPropertyColorClass?.('backgroundSize') || ''}`}>
            Size
          </label>
          <select
            className="w-full h-6 px-1.5 text-[10px] bg-background border border-border rounded"
            value={layer.size || 'cover'}
            onChange={(e) => onUpdate(layer.id, { size: e.target.value })}
          >
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="auto">Auto</option>
          </select>
        </div>
        <div>
          <label className={`text-[9px] text-muted-foreground mb-1 block ${getPropertyColorClass?.('backgroundPosition') || ''}`}>
            Position
          </label>
          <select
            className="w-full h-6 px-1.5 text-[10px] bg-background border border-border rounded"
            value={layer.position || 'center'}
            onChange={(e) => onUpdate(layer.id, { position: e.target.value })}
          >
            <option value="center">Center</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="top left">Top Left</option>
            <option value="top right">Top Right</option>
            <option value="bottom left">Bottom Left</option>
            <option value="bottom right">Bottom Right</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className={`text-[9px] text-muted-foreground mb-1 block ${getPropertyColorClass?.('backgroundRepeat') || ''}`}>
            Repeat
          </label>
          <select
            className="w-full h-6 px-1.5 text-[10px] bg-background border border-border rounded"
            value={layer.repeat || 'no-repeat'}
            onChange={(e) => onUpdate(layer.id, { repeat: e.target.value })}
          >
            <option value="no-repeat">No Repeat</option>
            <option value="repeat">Repeat</option>
            <option value="repeat-x">Repeat X</option>
            <option value="repeat-y">Repeat Y</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export const BackgroundLayersManager: React.FC<BackgroundLayersManagerProps> = ({
  layers,
  onChange,
  backgroundClip,
  onBackgroundClipChange,
  getPropertyColorClass,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const generateId = () => `bg-layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addLayer = (type: BackgroundLayerType) => {
    const newLayer: BackgroundLayerItem = {
      id: generateId(),
      type,
      value: type === 'fill' ? '#ffffff' : '',
      ...(type === 'media' && {
        size: 'cover',
        position: 'center',
        repeat: 'no-repeat',
      }),
    };
    onChange([...layers, newLayer]);
  };

  const updateLayer = (id: string, updates: Partial<BackgroundLayerItem>) => {
    onChange(layers.map(layer => 
      layer.id === id ? { ...layer, ...updates } : layer
    ));
  };

  const removeLayer = (id: string) => {
    onChange(layers.filter(layer => layer.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = layers.findIndex(l => l.id === active.id);
      const newIndex = layers.findIndex(l => l.id === over.id);
      onChange(arrayMove(layers, oldIndex, newIndex));
    }
  };

  const hasLayers = layers.length > 0;

  return (
    <div className="space-y-2">
      {/* Layers List */}
      {hasLayers && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={layers.map(l => l.id)}
            strategy={verticalListSortingStrategy}
          >
            {layers.map((layer) => (
              <div key={layer.id}>
                <SortableLayer
                  layer={layer}
                  onUpdate={updateLayer}
                  onRemove={removeLayer}
                  getPropertyColorClass={getPropertyColorClass}
                />
                <LayerOptions 
                  layer={layer} 
                  onUpdate={updateLayer}
                  getPropertyColorClass={getPropertyColorClass}
                />
              </div>
            ))}
          </SortableContext>
        </DndContext>
      )}

      {/* Add Layer Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-[11px] gap-1.5 border-dashed"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Background
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={() => addLayer('fill')} className="gap-2 text-xs">
            <Paintbrush className="w-3.5 h-3.5" />
            Fill
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => addLayer('gradient')} className="gap-2 text-xs">
            <Layers className="w-3.5 h-3.5" />
            Gradient
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => addLayer('media')} className="gap-2 text-xs">
            <ImageIcon className="w-3.5 h-3.5" />
            Media
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clip Option - Only shown when layers exist */}
      {hasLayers && onBackgroundClipChange && (
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Scissors className="w-3.5 h-3.5 text-muted-foreground" />
            <label className={`text-[10px] font-medium text-foreground uppercase tracking-wide ${getPropertyColorClass?.('backgroundClip') || ''}`}>
              Clip
            </label>
            <select
              className="flex-1 h-6 px-1.5 text-[10px] bg-background border border-border rounded"
              value={backgroundClip || 'border-box'}
              onChange={(e) => onBackgroundClipChange(e.target.value)}
            >
              <option value="border-box">Border Box</option>
              <option value="padding-box">Padding Box</option>
              <option value="content-box">Content Box</option>
              <option value="text">Text</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
