import React, { useState } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { useStyleStore } from '../store/useStyleStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Paintbrush, Settings, Zap, Plus } from 'lucide-react';
import '../styles/style-panel.css';
import '../styles/tokens.css';

export const StylePanel: React.FC = () => {
  const { getSelectedInstance, updateInstance } = useBuilderStore();
  const { setStyle, getComputedStyles, styleSources, createStyleSource, nextLocalClassName, renameStyleSource } = useStyleStore();
  const selectedInstance = getSelectedInstance();
  const [classNameInput, setClassNameInput] = useState('');

  const [openSections, setOpenSections] = useState({
    layout: true,
    space: false,
    size: false,
    position: false,
    typography: false,
    textShadows: false,
    backgrounds: false,
    borders: false,
    boxShadows: false,
    filters: false,
    backdropFilters: false,
    transitions: false,
    transforms: false,
    outline: false,
    advanced: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (!selectedInstance) {
    return (
      <div className="w-80 h-full bg-card border border-border rounded-lg shadow-xl flex flex-col overflow-hidden">
        <Tabs defaultValue="styles" className="flex-1 flex flex-col">
          <TabsList className="w-full grid grid-cols-3 rounded-none border-b bg-transparent h-9 p-0">
            <TabsTrigger value="styles" className="gap-1 text-xs h-full data-[state=active]:bg-accent rounded-none">
              <Paintbrush className="w-3 h-3" />
              Styles
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1 text-xs h-full data-[state=active]:bg-accent rounded-none">
              <Settings className="w-3 h-3" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="actions" className="gap-1 text-xs h-full data-[state=active]:bg-accent rounded-none">
              <Zap className="w-3 h-3" />
              Actions
            </TabsTrigger>
          </TabsList>
          <TabsContent value="styles" className="flex-1 m-0 p-3 overflow-y-auto">
            <div className="text-xs text-muted-foreground text-center">
              Select an element to edit its style
            </div>
          </TabsContent>
          <TabsContent value="settings" className="flex-1 m-0 p-3 overflow-y-auto">
            <div className="text-xs text-muted-foreground">Settings panel coming soon</div>
          </TabsContent>
          <TabsContent value="actions" className="flex-1 m-0 p-3 overflow-y-auto">
            <div className="text-xs text-muted-foreground">Actions panel coming soon</div>
          </TabsContent>
        </Tabs>
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

  const renameClass = (newName: string) => {
    if (!styleSourceId) return;
    renameStyleSource(styleSourceId, newName);
  };

  // Initialize class name input when selected instance changes
  React.useEffect(() => {
    if (styleSource) {
      setClassNameInput(styleSource.name);
    }
  }, [styleSource?.name]);

  const classes = selectedInstance.styleSourceIds
    ?.map((id) => ({
      id,
      name: styleSources[id]?.name || id,
      isActive: id === styleSourceId,
    }))
    .filter(Boolean) || [];

  const isFlexDisplay = computedStyles.display === 'flex';

  const AccordionSection: React.FC<{
    title: string;
    section: keyof typeof openSections;
    children?: React.ReactNode;
    hasAddButton?: boolean;
    indicator?: boolean;
  }> = ({ title, section, children, hasAddButton, indicator }) => (
    <div className="Section">
      <div className="SectionHeader" onClick={() => toggleSection(section)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span className="SectionTitle">{title}</span>
          {indicator && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'hsl(30, 100%, 60%)' }} />}
        </div>
        {hasAddButton && <Plus className={`SectionIcon ${openSections[section] ? 'open' : ''}`} size={18} />}
      </div>
      {openSections[section] && children && <div className="SectionContent">{children}</div>}
    </div>
  );

  return (
    <div className="w-80 h-full bg-card border border-border rounded-lg shadow-xl flex flex-col overflow-hidden">
      <Tabs defaultValue="styles" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-3 rounded-none border-b bg-transparent h-9 p-0">
          <TabsTrigger value="styles" className="gap-1 text-xs h-full data-[state=active]:bg-accent rounded-none">
            <Paintbrush className="w-3 h-3" />
            Styles
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1 text-xs h-full data-[state=active]:bg-accent rounded-none">
            <Settings className="w-3 h-3" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="actions" className="gap-1 text-xs h-full data-[state=active]:bg-accent rounded-none">
            <Zap className="w-3 h-3" />
            Actions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="styles" className="flex-1 m-0 overflow-y-auto">
          <div className="StylePanel">
            {/* Element Type Header */}
            <div style={{ 
              padding: 'var(--space-2) var(--space-2)',
              borderBottom: '1px solid hsl(var(--border))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ fontSize: '12px' }}>🖼️</span>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>{selectedInstance.type}</span>
              </div>
            </div>

            {/* Class Name Input */}
            <div style={{ padding: 'var(--space-2)', borderBottom: '1px solid hsl(var(--border))' }}>
              <input
                className="Input"
                placeholder="class-name another-class"
                value={classNameInput}
                onChange={(e) => setClassNameInput(e.target.value)}
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    renameClass(e.target.value.trim());
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                style={{ 
                  width: '100%'
                }}
              />
            </div>

      {/* Layout */}
      <AccordionSection title="Layout" section="layout">
        <div className="Col">
          <div className="Row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="Label" style={{ color: 'hsl(12, 76%, 61%)', fontWeight: 600 }}>Display</label>
            <select
              className="Select"
              value={computedStyles.display || 'block'}
              onChange={(e) => updateStyle('display', e.target.value)}
              style={{ flex: 1, marginLeft: 'var(--space-2)' }}
            >
              <option value="block">block</option>
              <option value="flex">flex</option>
              <option value="inline">inline</option>
              <option value="inline-block">inline-block</option>
              <option value="grid">grid</option>
              <option value="none">none</option>
            </select>
          </div>

          {isFlexDisplay && (
            <div className="FlexControls" style={{ marginTop: 'var(--space-3)' }}>
              <div className="AlignGrid">
                {Array.from({ length: 9 }).map((_, i) => {
                  const row = Math.floor(i / 3);
                  const col = i % 3;
                  const isActive = 
                    (computedStyles.justifyContent === 'flex-start' && col === 0) ||
                    (computedStyles.justifyContent === 'center' && col === 1) ||
                    (computedStyles.justifyContent === 'flex-end' && col === 2);
                  
                  return (
                    <button 
                      key={i} 
                      className="AlignBtn"
                      data-state={row === 1 && isActive ? "on" : "off"}
                      onClick={() => {
                        if (col === 0) updateStyle('justifyContent', 'flex-start');
                        if (col === 1) updateStyle('justifyContent', 'center');
                        if (col === 2) updateStyle('justifyContent', 'flex-end');
                      }}
                    />
                  );
                })}
              </div>

              <div className="FlexControlsColumn">
                <div className="Col">
                  <label className="Label">Direction</label>
                  <select
                    className="Select"
                    value={computedStyles.flexDirection || 'row'}
                    onChange={(e) => updateStyle('flexDirection', e.target.value)}
                  >
                    <option value="row">row</option>
                    <option value="column">column</option>
                  </select>
                </div>

                <div className="Col">
                  <label className="Label">Justify</label>
                  <select
                    className="Select"
                    value={computedStyles.justifyContent || 'flex-start'}
                    onChange={(e) => updateStyle('justifyContent', e.target.value)}
                  >
                    <option value="flex-start">start</option>
                    <option value="center">center</option>
                    <option value="flex-end">end</option>
                    <option value="space-between">space-between</option>
                  </select>
                </div>

                <div className="Col">
                  <label className="Label">Align</label>
                  <select
                    className="Select"
                    value={computedStyles.alignItems || 'stretch'}
                    onChange={(e) => updateStyle('alignItems', e.target.value)}
                  >
                    <option value="stretch">stretch</option>
                    <option value="flex-start">start</option>
                    <option value="center">center</option>
                    <option value="flex-end">end</option>
                  </select>
                </div>

                <div className="Row" style={{ gap: 'var(--space-2)' }}>
                  <input
                    className="Input SpaceInputSmall"
                    type="text"
                    value={computedStyles.gap?.replace(/[a-z%]/gi, '') || '0'}
                    onChange={(e) => updateStyle('gap', e.target.value + 'px')}
                  />
                  <span className="Label">PX</span>
                  <span style={{ fontSize: '18px', color: 'var(--subtle)' }}>🔗</span>
                  <input
                    className="Input SpaceInputSmall"
                    type="text"
                    value={computedStyles.gap?.replace(/[a-z%]/gi, '') || '0'}
                    onChange={(e) => updateStyle('gap', e.target.value + 'px')}
                  />
                  <span className="Label">PX</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </AccordionSection>

      {/* Space */}
      <AccordionSection title="Space" section="space">
        <div className="SpaceBox">
          <div className="SpaceMarginLabel">MARGIN</div>
          <div className="SpaceOuter">
            {/* Top margin */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <input
                className="Input SpaceInput"
                placeholder="0"
                value={computedStyles.marginTop?.replace(/[a-z%]/gi, '') || ''}
                onChange={(e) => updateStyle('marginTop', e.target.value + 'px')}
              />
            </div>

            {/* Middle row with left margin, padding box, right margin */}
            <div className="SpaceRow">
              <input
                className="Input SpaceInput"
                placeholder="0"
                value={computedStyles.marginLeft?.replace(/[a-z%]/gi, '') || ''}
                onChange={(e) => updateStyle('marginLeft', e.target.value + 'px')}
              />
              
              <div className="SpaceRing">
                <div className="SpacePaddingLabel">PADDING</div>
                
                {/* Top padding */}
                <input
                  className="Input SpaceInputSmall"
                  placeholder="0"
                  value={computedStyles.paddingTop?.replace(/[a-z%]/gi, '') || ''}
                  onChange={(e) => updateStyle('paddingTop', e.target.value + 'px')}
                  style={{ alignSelf: 'center' }}
                />
                
                {/* Left and Right padding */}
                <div className="SpacePaddingRow">
                  <input
                    className="Input SpaceInputSmall"
                    placeholder="0"
                    value={computedStyles.paddingLeft?.replace(/[a-z%]/gi, '') || ''}
                    onChange={(e) => updateStyle('paddingLeft', e.target.value + 'px')}
                  />
                  <div style={{ flex: 1 }} />
                  <input
                    className="Input SpaceInputSmall"
                    placeholder="0"
                    value={computedStyles.paddingRight?.replace(/[a-z%]/gi, '') || ''}
                    onChange={(e) => updateStyle('paddingRight', e.target.value + 'px')}
                  />
                </div>
                
                {/* Bottom padding */}
                <input
                  className="Input SpaceInputSmall"
                  placeholder="0"
                  value={computedStyles.paddingBottom?.replace(/[a-z%]/gi, '') || ''}
                  onChange={(e) => updateStyle('paddingBottom', e.target.value + 'px')}
                  style={{ alignSelf: 'center' }}
                />
              </div>

              <input
                className="Input SpaceInput"
                placeholder="0"
                value={computedStyles.marginRight?.replace(/[a-z%]/gi, '') || ''}
                onChange={(e) => updateStyle('marginRight', e.target.value + 'px')}
              />
            </div>

            {/* Bottom margin */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <input
                className="Input SpaceInput"
                placeholder="0"
                value={computedStyles.marginBottom?.replace(/[a-z%]/gi, '') || ''}
                onChange={(e) => updateStyle('marginBottom', e.target.value + 'px')}
              />
            </div>
          </div>
        </div>
      </AccordionSection>

      {/* Size */}
      <AccordionSection title="Size" section="size">
        <div className="SizeGrid">
          <div className="Col">
            <label className="Label">Width</label>
            <input
              className="Input"
              placeholder="auto"
              value={computedStyles.width || ''}
              onChange={(e) => updateStyle('width', e.target.value)}
            />
          </div>
          <div className="Col">
            <label className="Label">Height</label>
            <input
              className="Input"
              placeholder="auto"
              value={computedStyles.height || ''}
              onChange={(e) => updateStyle('height', e.target.value)}
            />
          </div>
          <div className="Col">
            <label className="Label">Min Width</label>
            <input
              className="Input"
              placeholder="auto"
              value={computedStyles.minWidth || ''}
              onChange={(e) => updateStyle('minWidth', e.target.value)}
            />
          </div>
          <div className="Col">
            <label className="Label">Min Height</label>
            <input
              className="Input"
              placeholder="auto"
              value={computedStyles.minHeight || ''}
              onChange={(e) => updateStyle('minHeight', e.target.value)}
            />
          </div>
        </div>
      </AccordionSection>

      {/* Position */}
      <AccordionSection title="Position" section="position" hasAddButton />

      {/* Typography */}
      <AccordionSection title="Typography" section="typography" indicator>
        <div className="Col">
          <div className="SizeGrid">
            <div className="Col">
              <label className="Label">Font Size</label>
              <input
                className="Input"
                placeholder="16px"
                value={computedStyles.fontSize || ''}
                onChange={(e) => updateStyle('fontSize', e.target.value)}
              />
            </div>
            <div className="Col">
              <label className="Label">Font Weight</label>
              <select
                className="Select"
                value={computedStyles.fontWeight || '400'}
                onChange={(e) => updateStyle('fontWeight', e.target.value)}
              >
                <option value="300">Light</option>
                <option value="400">Normal</option>
                <option value="500">Medium</option>
                <option value="600">Semibold</option>
                <option value="700">Bold</option>
              </select>
            </div>
          </div>
        </div>
      </AccordionSection>

      {/* Text Shadows */}
      <AccordionSection title="Text Shadows" section="textShadows" hasAddButton />

      {/* Backgrounds */}
      <AccordionSection title="Backgrounds" section="backgrounds" hasAddButton>
        <div className="Col">
          <label className="Label">Background Color</label>
          <input
            className="Input"
            placeholder="transparent"
            value={computedStyles.backgroundColor || ''}
            onChange={(e) => updateStyle('backgroundColor', e.target.value)}
          />
        </div>
      </AccordionSection>

      {/* Borders */}
      <AccordionSection title="Borders" section="borders">
        <div className="Col">
          <label className="Label">Border</label>
          <input
            className="Input"
            placeholder="none"
            value={computedStyles.border || ''}
            onChange={(e) => updateStyle('border', e.target.value)}
          />
          <label className="Label">Border Radius</label>
          <input
            className="Input"
            placeholder="0"
            value={computedStyles.borderRadius || ''}
            onChange={(e) => updateStyle('borderRadius', e.target.value)}
          />
        </div>
      </AccordionSection>

      {/* Box Shadows */}
      <AccordionSection title="Box Shadows" section="boxShadows" hasAddButton />

      {/* Filters */}
      <AccordionSection title="Filters" section="filters" hasAddButton />

      {/* Backdrop Filters */}
      <AccordionSection title="Backdrop Filters" section="backdropFilters" hasAddButton />

      {/* Transitions */}
      <AccordionSection title="Transitions" section="transitions" hasAddButton />

      {/* Transforms */}
      <AccordionSection title="Transforms" section="transforms" hasAddButton />

      {/* Outline */}
      <AccordionSection title="Outline" section="outline" />

      {/* Advanced */}
      <AccordionSection title="Advanced" section="advanced" hasAddButton />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 m-0 p-3 overflow-y-auto">
          <div className="text-xs text-muted-foreground">Settings panel coming soon</div>
        </TabsContent>

        <TabsContent value="actions" className="flex-1 m-0 p-3 overflow-y-auto">
          <div className="text-xs text-muted-foreground">Actions panel coming soon</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
