import React from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { componentRegistry } from '../primitives/registry';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Inspector: React.FC = () => {
  const selectedInstance = useBuilderStore((state) => state.getSelectedInstance());
  const updateInstance = useBuilderStore((state) => state.updateInstance);

  if (!selectedInstance) {
    return (
      <div className="w-80 border-l border-border bg-card flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Select an element to inspect</p>
      </div>
    );
  }

  const meta = componentRegistry[selectedInstance.type];

  const updateProp = (key: string, value: any) => {
    updateInstance(selectedInstance.id, {
      props: { ...selectedInstance.props, [key]: value },
    });
  };

  const updateStyle = (key: string, value: string) => {
    updateInstance(selectedInstance.id, {
      styles: { ...selectedInstance.styles, [key]: value },
    });
  };

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Inspector</h2>
        <p className="text-xs text-muted-foreground mt-1">{selectedInstance.type}</p>
      </div>

      <ScrollArea className="flex-1">
        <Tabs defaultValue="props" className="w-full">
          <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
            <TabsTrigger value="props">Props</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
          </TabsList>

          <TabsContent value="props" className="p-4 space-y-4">
            {meta?.propsDefinition && Object.entries(meta.propsDefinition).map(([key, propDef]) => (
              <div key={key} className="space-y-2">
                <Label className="text-xs">{propDef.label}</Label>
                {propDef.control === 'text' && (
                  <Input
                    value={selectedInstance.props[key] || ''}
                    onChange={(e) => updateProp(key, e.target.value)}
                    className="h-8 text-xs"
                  />
                )}
                {propDef.control === 'textarea' && (
                  <Textarea
                    value={selectedInstance.props[key] || ''}
                    onChange={(e) => updateProp(key, e.target.value)}
                    className="text-xs min-h-[60px]"
                  />
                )}
                {propDef.control === 'select' && propDef.options && (
                  <Select
                    value={selectedInstance.props[key] || propDef.defaultValue}
                    onValueChange={(value) => updateProp(key, value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {propDef.options.map((option) => (
                        <SelectItem key={option} value={option} className="text-xs">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="style" className="p-4 space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold mb-3 text-foreground">Layout</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Display</Label>
                    <Select
                      value={selectedInstance.styles.display || 'block'}
                      onValueChange={(value) => updateStyle('display', value)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="block">Block</SelectItem>
                        <SelectItem value="flex">Flex</SelectItem>
                        <SelectItem value="inline">Inline</SelectItem>
                        <SelectItem value="inline-block">Inline Block</SelectItem>
                        <SelectItem value="grid">Grid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedInstance.styles.display === 'flex' && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-xs">Flex Direction</Label>
                        <Select
                          value={selectedInstance.styles.flexDirection || 'row'}
                          onValueChange={(value) => updateStyle('flexDirection', value)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="row">Row</SelectItem>
                            <SelectItem value="column">Column</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Gap</Label>
                        <Input
                          value={selectedInstance.styles.gap || ''}
                          onChange={(e) => updateStyle('gap', e.target.value)}
                          placeholder="e.g., 16px"
                          className="h-8 text-xs"
                        />
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label className="text-xs">Width</Label>
                      <Input
                        value={selectedInstance.styles.width || ''}
                        onChange={(e) => updateStyle('width', e.target.value)}
                        placeholder="auto"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Height</Label>
                      <Input
                        value={selectedInstance.styles.height || ''}
                        onChange={(e) => updateStyle('height', e.target.value)}
                        placeholder="auto"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Padding</Label>
                    <Input
                      value={selectedInstance.styles.padding || ''}
                      onChange={(e) => updateStyle('padding', e.target.value)}
                      placeholder="e.g., 16px"
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Margin</Label>
                    <Input
                      value={selectedInstance.styles.margin || ''}
                      onChange={(e) => updateStyle('margin', e.target.value)}
                      placeholder="e.g., 16px"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold mb-3 text-foreground">Typography</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Font Size</Label>
                    <Input
                      value={selectedInstance.styles.fontSize || ''}
                      onChange={(e) => updateStyle('fontSize', e.target.value)}
                      placeholder="e.g., 16px"
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Font Weight</Label>
                    <Select
                      value={selectedInstance.styles.fontWeight || '400'}
                      onValueChange={(value) => updateStyle('fontWeight', value)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="300">Light</SelectItem>
                        <SelectItem value="400">Normal</SelectItem>
                        <SelectItem value="500">Medium</SelectItem>
                        <SelectItem value="600">Semibold</SelectItem>
                        <SelectItem value="700">Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Color</Label>
                    <Input
                      value={selectedInstance.styles.color || ''}
                      onChange={(e) => updateStyle('color', e.target.value)}
                      placeholder="e.g., hsl(var(--foreground))"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold mb-3 text-foreground">Background</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Background Color</Label>
                    <Input
                      value={selectedInstance.styles.backgroundColor || ''}
                      onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                      placeholder="e.g., hsl(var(--background))"
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Border Radius</Label>
                    <Input
                      value={selectedInstance.styles.borderRadius || ''}
                      onChange={(e) => updateStyle('borderRadius', e.target.value)}
                      placeholder="e.g., 8px"
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Border</Label>
                    <Input
                      value={selectedInstance.styles.border || ''}
                      onChange={(e) => updateStyle('border', e.target.value)}
                      placeholder="e.g., 1px solid black"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
};
