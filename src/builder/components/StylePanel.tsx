import React from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const StylePanel: React.FC = () => {
  const selectedInstance = useBuilderStore((state) => state.getSelectedInstance());
  const updateInstance = useBuilderStore((state) => state.updateInstance);
  const [openSections, setOpenSections] = React.useState({
    layout: true,
    space: true,
    size: true,
    typography: true,
    backgrounds: true,
    borders: true,
  });

  if (!selectedInstance) {
    return (
      <div className="w-80 border-l border-border bg-card flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Select an element</p>
      </div>
    );
  }

  const updateStyle = (key: string, value: string) => {
    updateInstance(selectedInstance.id, {
      styles: { ...selectedInstance.styles, [key]: value },
    });
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const StyleSection: React.FC<{
    id: keyof typeof openSections;
    title: string;
    children: React.ReactNode;
  }> = ({ id, title, children }) => (
    <Collapsible open={openSections[id]} onOpenChange={() => toggleSection(id)}>
      <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2 hover:bg-accent/50 text-sm font-medium">
        <span>{title}</span>
        {openSections[id] ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 py-3 space-y-3 border-b border-border">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <div className="w-80 h-full bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-xl flex flex-col overflow-hidden">
      <Tabs defaultValue="style" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-2 rounded-none border-b bg-transparent">
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">
              {selectedInstance.type}
            </Label>
          </div>
          
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Style Sources</Label>
            <div className="flex gap-2">
              <Badge variant="default" className="text-xs">Local</Badge>
              <Badge variant="outline" className="text-xs">Pageset</Badge>
            </div>
          </div>
        </div>

        <TabsContent value="style" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="divide-y divide-border">
              <StyleSection id="layout" title="Layout">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Display</Label>
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
                      <SelectItem value="inline-flex">Inline Flex</SelectItem>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="inline">Inline</SelectItem>
                      <SelectItem value="inline-block">Inline Block</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedInstance.styles.display === 'flex' && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Flex Direction</Label>
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
                          <SelectItem value="row-reverse">Row Reverse</SelectItem>
                          <SelectItem value="column-reverse">Column Reverse</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Justify Content</Label>
                      <Select
                        value={selectedInstance.styles.justifyContent || 'flex-start'}
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
                      <Label className="text-xs text-muted-foreground">Align Items</Label>
                      <Select
                        value={selectedInstance.styles.alignItems || 'stretch'}
                        onValueChange={(value) => updateStyle('alignItems', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stretch">Stretch</SelectItem>
                          <SelectItem value="flex-start">Start</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="flex-end">End</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </StyleSection>

              <StyleSection id="space" title="Space">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Gap</Label>
                  <Input
                    value={selectedInstance.styles.gap || ''}
                    onChange={(e) => updateStyle('gap', e.target.value)}
                    placeholder="0px"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Padding</Label>
                  <Input
                    value={selectedInstance.styles.padding || ''}
                    onChange={(e) => updateStyle('padding', e.target.value)}
                    placeholder="0px"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Margin</Label>
                  <Input
                    value={selectedInstance.styles.margin || ''}
                    onChange={(e) => updateStyle('margin', e.target.value)}
                    placeholder="0px"
                    className="h-8 text-xs"
                  />
                </div>
              </StyleSection>

              <StyleSection id="size" title="Size">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Width</Label>
                    <Input
                      value={selectedInstance.styles.width || ''}
                      onChange={(e) => updateStyle('width', e.target.value)}
                      placeholder="auto"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Height</Label>
                    <Input
                      value={selectedInstance.styles.height || ''}
                      onChange={(e) => updateStyle('height', e.target.value)}
                      placeholder="auto"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Min Width</Label>
                    <Input
                      value={selectedInstance.styles.minWidth || ''}
                      onChange={(e) => updateStyle('minWidth', e.target.value)}
                      placeholder="0"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Min Height</Label>
                    <Input
                      value={selectedInstance.styles.minHeight || ''}
                      onChange={(e) => updateStyle('minHeight', e.target.value)}
                      placeholder="0"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Max Width</Label>
                    <Input
                      value={selectedInstance.styles.maxWidth || ''}
                      onChange={(e) => updateStyle('maxWidth', e.target.value)}
                      placeholder="none"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Max Height</Label>
                    <Input
                      value={selectedInstance.styles.maxHeight || ''}
                      onChange={(e) => updateStyle('maxHeight', e.target.value)}
                      placeholder="none"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </StyleSection>

              <StyleSection id="typography" title="Typography">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Font</Label>
                  <Input
                    value={selectedInstance.styles.fontFamily || ''}
                    onChange={(e) => updateStyle('fontFamily', e.target.value)}
                    placeholder="Arial, Roboto..."
                    className="h-8 text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Size</Label>
                    <Input
                      value={selectedInstance.styles.fontSize || ''}
                      onChange={(e) => updateStyle('fontSize', e.target.value)}
                      placeholder="16px"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Height</Label>
                    <Input
                      value={selectedInstance.styles.lineHeight || ''}
                      onChange={(e) => updateStyle('lineHeight', e.target.value)}
                      placeholder="1.5"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Spacing</Label>
                    <Input
                      value={selectedInstance.styles.letterSpacing || ''}
                      onChange={(e) => updateStyle('letterSpacing', e.target.value)}
                      placeholder="0"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Weight</Label>
                  <Select
                    value={selectedInstance.styles.fontWeight || '400'}
                    onValueChange={(value) => updateStyle('fontWeight', value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Normal (400)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">Thin (100)</SelectItem>
                      <SelectItem value="200">Extra Light (200)</SelectItem>
                      <SelectItem value="300">Light (300)</SelectItem>
                      <SelectItem value="400">Normal (400)</SelectItem>
                      <SelectItem value="500">Medium (500)</SelectItem>
                      <SelectItem value="600">Semibold (600)</SelectItem>
                      <SelectItem value="700">Bold (700)</SelectItem>
                      <SelectItem value="800">Extra Bold (800)</SelectItem>
                      <SelectItem value="900">Black (900)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Color</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type="color"
                        value={selectedInstance.styles.color?.includes('#') ? selectedInstance.styles.color : '#000000'}
                        onChange={(e) => updateStyle('color', e.target.value)}
                        className="h-8 w-12 p-1 cursor-pointer"
                      />
                    </div>
                    <Input
                      value={selectedInstance.styles.color || ''}
                      onChange={(e) => updateStyle('color', e.target.value)}
                      placeholder="black"
                      className="h-8 text-xs flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Text Align</Label>
                  <Select
                    value={selectedInstance.styles.textAlign || 'left'}
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
              </StyleSection>

              <StyleSection id="backgrounds" title="Backgrounds">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Background Color</Label>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Input
                        type="color"
                        value={selectedInstance.styles.backgroundColor?.includes('#') ? selectedInstance.styles.backgroundColor : '#ffffff'}
                        onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                        className="h-8 w-12 p-1 cursor-pointer"
                      />
                    </div>
                    <Input
                      value={selectedInstance.styles.backgroundColor || ''}
                      onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                      placeholder="transparent"
                      className="h-8 text-xs flex-1"
                    />
                  </div>
                </div>
              </StyleSection>

              <StyleSection id="borders" title="Borders">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Border</Label>
                  <Input
                    value={selectedInstance.styles.border || ''}
                    onChange={(e) => updateStyle('border', e.target.value)}
                    placeholder="none"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Border Radius</Label>
                  <Input
                    value={selectedInstance.styles.borderRadius || ''}
                    onChange={(e) => updateStyle('borderRadius', e.target.value)}
                    placeholder="0px"
                    className="h-8 text-xs"
                  />
                </div>
              </StyleSection>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 m-0 p-4">
          <p className="text-xs text-muted-foreground">Component settings will appear here</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};
