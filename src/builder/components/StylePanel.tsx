import React, { useState } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { useStyleStore } from '../store/useStyleStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const StylePanel: React.FC = () => {
  const { getSelectedInstance, updateInstance } = useBuilderStore();
  const { setStyle, getComputedStyles, styleSources, createStyleSource, nextLocalClassName } = useStyleStore();
  const selectedInstance = getSelectedInstance();

  const [openSections, setOpenSections] = useState({
    layout: true,
    space: true,
    size: true,
    typography: true,
    backgrounds: false,
    borders: false,
  });

  if (!selectedInstance) {
    return (
      <div className="w-80 bg-background border-l border-border flex items-center justify-center text-sm text-muted-foreground">
        Select an element to edit its style
      </div>
    );
  }

  const styleSourceId = selectedInstance.styleSourceIds?.[0];
  const styleSource = styleSourceId ? styleSources[styleSourceId] : undefined;
  const computedStyles = getComputedStyles(selectedInstance.styleSourceIds || []);

  const ensureLocalClass = () => {
    if (!selectedInstance.styleSourceIds || selectedInstance.styleSourceIds.length === 0) {
      const name = nextLocalClassName(selectedInstance.type);
      const id = createStyleSource('local', name);
      updateInstance(selectedInstance.id, { styleSourceIds: [id] });
      return id;
    }
    return selectedInstance.styleSourceIds[0];
  };

  const updateStyle = (property: string, value: string) => {
    const id = styleSourceId || ensureLocalClass();
    if (id) setStyle(id, property, value);
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const StyleSection: React.FC<{
    title: string;
    section: keyof typeof openSections;
    children: React.ReactNode;
  }> = ({ title, section, children }) => (
    <div className="border-b border-border">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium hover:bg-accent/50 transition-colors"
      >
        <span>{title}</span>
        {openSections[section] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {openSections[section] && <div className="p-3 space-y-3">{children}</div>}
    </div>
  );

  return (
    <div className="w-80 bg-background border-l border-border flex flex-col">
      <Tabs defaultValue="style" className="flex-1 flex flex-col">
        <TabsList className="w-full rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger value="style" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
            Style
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="style" className="flex-1 mt-0 overflow-hidden">
          {/* Style Source Badge */}
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Style:</span>
              <Badge variant="secondary" className="text-xs">
                {styleSource?.name || styleSourceId}
              </Badge>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-200px)]">
            {/* Layout Section */}
            <StyleSection title="Layout" section="layout">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Display</Label>
                <Select
                  value={computedStyles.display || 'block'}
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
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {computedStyles.display === 'flex' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Direction</Label>
                    <Select
                      value={computedStyles.flexDirection || 'row'}
                      onValueChange={(value) => updateStyle('flexDirection', value)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="row">Row</SelectItem>
                        <SelectItem value="column">Column</SelectItem>
                        <SelectItem value="row-reverse">Row Reverse</SelectItem>
                        <SelectItem value="column-reverse">Column Reverse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Justify</Label>
                    <Select
                      value={computedStyles.justifyContent || 'flex-start'}
                      onValueChange={(value) => updateStyle('justifyContent', value)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flex-start">Start</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="flex-end">End</SelectItem>
                        <SelectItem value="space-between">Space Between</SelectItem>
                        <SelectItem value="space-around">Space Around</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Align</Label>
                    <Select
                      value={computedStyles.alignItems || 'flex-start'}
                      onValueChange={(value) => updateStyle('alignItems', value)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flex-start">Start</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="flex-end">End</SelectItem>
                        <SelectItem value="stretch">Stretch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Gap</Label>
                    <Input
                      type="text"
                      value={computedStyles.gap || ''}
                      onChange={(e) => updateStyle('gap', e.target.value)}
                      placeholder="e.g., 16px"
                      className="h-8 text-xs"
                    />
                  </div>
                </>
              )}
            </StyleSection>

            {/* Space Section */}
            <StyleSection title="Space" section="space">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Margin</Label>
                  <div className="grid grid-cols-3 gap-1">
                    <div />
                    <Input
                      type="text"
                      value={computedStyles.marginTop || ''}
                      onChange={(e) => updateStyle('marginTop', e.target.value)}
                      placeholder="Top"
                      className="h-8 text-xs text-center"
                    />
                    <div />
                    <Input
                      type="text"
                      value={computedStyles.marginLeft || ''}
                      onChange={(e) => updateStyle('marginLeft', e.target.value)}
                      placeholder="Left"
                      className="h-8 text-xs text-center"
                    />
                    <div className="flex items-center justify-center text-xs text-muted-foreground">M</div>
                    <Input
                      type="text"
                      value={computedStyles.marginRight || ''}
                      onChange={(e) => updateStyle('marginRight', e.target.value)}
                      placeholder="Right"
                      className="h-8 text-xs text-center"
                    />
                    <div />
                    <Input
                      type="text"
                      value={computedStyles.marginBottom || ''}
                      onChange={(e) => updateStyle('marginBottom', e.target.value)}
                      placeholder="Bottom"
                      className="h-8 text-xs text-center"
                    />
                    <div />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Padding</Label>
                  <div className="grid grid-cols-3 gap-1">
                    <div />
                    <Input
                      type="text"
                      value={computedStyles.paddingTop || ''}
                      onChange={(e) => updateStyle('paddingTop', e.target.value)}
                      placeholder="Top"
                      className="h-8 text-xs text-center"
                    />
                    <div />
                    <Input
                      type="text"
                      value={computedStyles.paddingLeft || ''}
                      onChange={(e) => updateStyle('paddingLeft', e.target.value)}
                      placeholder="Left"
                      className="h-8 text-xs text-center"
                    />
                    <div className="flex items-center justify-center text-xs text-muted-foreground">P</div>
                    <Input
                      type="text"
                      value={computedStyles.paddingRight || ''}
                      onChange={(e) => updateStyle('paddingRight', e.target.value)}
                      placeholder="Right"
                      className="h-8 text-xs text-center"
                    />
                    <div />
                    <Input
                      type="text"
                      value={computedStyles.paddingBottom || ''}
                      onChange={(e) => updateStyle('paddingBottom', e.target.value)}
                      placeholder="Bottom"
                      className="h-8 text-xs text-center"
                    />
                    <div />
                  </div>
                </div>
              </div>
            </StyleSection>

            {/* Size Section */}
            <StyleSection title="Size" section="size">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Width</Label>
                    <Input
                      type="text"
                      value={computedStyles.width || ''}
                      onChange={(e) => updateStyle('width', e.target.value)}
                      placeholder="auto"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Height</Label>
                    <Input
                      type="text"
                      value={computedStyles.height || ''}
                      onChange={(e) => updateStyle('height', e.target.value)}
                      placeholder="auto"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Min W</Label>
                    <Input
                      type="text"
                      value={computedStyles.minWidth || ''}
                      onChange={(e) => updateStyle('minWidth', e.target.value)}
                      placeholder="0"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Min H</Label>
                    <Input
                      type="text"
                      value={computedStyles.minHeight || ''}
                      onChange={(e) => updateStyle('minHeight', e.target.value)}
                      placeholder="0"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Max W</Label>
                    <Input
                      type="text"
                      value={computedStyles.maxWidth || ''}
                      onChange={(e) => updateStyle('maxWidth', e.target.value)}
                      placeholder="none"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Max H</Label>
                    <Input
                      type="text"
                      value={computedStyles.maxHeight || ''}
                      onChange={(e) => updateStyle('maxHeight', e.target.value)}
                      placeholder="none"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            </StyleSection>

            {/* Typography Section */}
            <StyleSection title="Typography" section="typography">
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Font Family</Label>
                  <Input
                    type="text"
                    value={computedStyles.fontFamily || ''}
                    onChange={(e) => updateStyle('fontFamily', e.target.value)}
                    placeholder="inherit"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Size</Label>
                    <Input
                      type="text"
                      value={computedStyles.fontSize || ''}
                      onChange={(e) => updateStyle('fontSize', e.target.value)}
                      placeholder="16px"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Weight</Label>
                    <Select
                      value={computedStyles.fontWeight || '400'}
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
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Line Height</Label>
                    <Input
                      type="text"
                      value={computedStyles.lineHeight || ''}
                      onChange={(e) => updateStyle('lineHeight', e.target.value)}
                      placeholder="1.5"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Letter Spacing</Label>
                    <Input
                      type="text"
                      value={computedStyles.letterSpacing || ''}
                      onChange={(e) => updateStyle('letterSpacing', e.target.value)}
                      placeholder="normal"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Color</Label>
                  <Input
                    type="text"
                    value={computedStyles.color || ''}
                    onChange={(e) => updateStyle('color', e.target.value)}
                    placeholder="hsl(var(--foreground))"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Align</Label>
                  <Select
                    value={computedStyles.textAlign || 'left'}
                    onValueChange={(value) => updateStyle('textAlign', value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                      <SelectItem value="justify">Justify</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </StyleSection>

            {/* Backgrounds Section */}
            <StyleSection title="Backgrounds" section="backgrounds">
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Background Color</Label>
                  <Input
                    type="text"
                    value={computedStyles.backgroundColor || ''}
                    onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                    placeholder="transparent"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </StyleSection>

            {/* Borders Section */}
            <StyleSection title="Borders" section="borders">
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Border</Label>
                  <Input
                    type="text"
                    value={computedStyles.border || ''}
                    onChange={(e) => updateStyle('border', e.target.value)}
                    placeholder="1px solid #000"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Border Radius</Label>
                  <Input
                    type="text"
                    value={computedStyles.borderRadius || ''}
                    onChange={(e) => updateStyle('borderRadius', e.target.value)}
                    placeholder="0px"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </StyleSection>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 mt-0">
          <div className="p-3 text-sm text-muted-foreground">
            Settings panel (coming soon)
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
