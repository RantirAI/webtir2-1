import React, { useState } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { useStyleStore } from '../store/useStyleStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Paintbrush, Settings, Zap, Plus, Square, Type, Heading as HeadingIcon, MousePointerClick, Image as ImageIcon, Link as LinkIcon, X, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { componentRegistry } from '../primitives/registry';
import { UnitInput } from './UnitInput';
import '../styles/style-panel.css';
import '../styles/tokens.css';

export const StylePanel: React.FC = () => {
  const { getSelectedInstance, updateInstance } = useBuilderStore();
  const { setStyle, getComputedStyles, styleSources, createStyleSource, nextLocalClassName, renameStyleSource } = useStyleStore();
  const selectedInstance = getSelectedInstance();
  const [classNameInput, setClassNameInput] = useState('');
  const [classNames, setClassNames] = useState<string[]>([]);
  const [currentState, setCurrentState] = useState<string>('base');

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

  const styleSourceId = selectedInstance?.styleSourceIds?.[0];
  const styleSource = styleSourceId ? styleSources[styleSourceId] : undefined;
  const computedStyles = selectedInstance ? getComputedStyles(selectedInstance.styleSourceIds || []) : {};

  // Initialize class names - MUST be before early return to follow hooks rules
  React.useEffect(() => {
    if (styleSource) {
      const names = styleSource.name.split(' ').filter(Boolean);
      setClassNames(names);
      setClassNameInput('');
    }
  }, [styleSource?.name]);

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

  const classes = selectedInstance.styleSourceIds
    ?.map((id) => ({
      id,
      name: styleSources[id]?.name || id,
      isActive: id === styleSourceId,
    }))
    .filter(Boolean) || [];

  const isFlexDisplay = computedStyles.display === 'flex';

  const getComponentIcon = (type: string) => {
    const iconName = componentRegistry[type]?.icon;
    const iconMap: Record<string, React.ReactNode> = {
      Square: <Square className="w-4 h-4" />,
      Type: <Type className="w-4 h-4" />,
      Heading: <HeadingIcon className="w-4 h-4" />,
      MousePointerClick: <MousePointerClick className="w-4 h-4" />,
      Image: <ImageIcon className="w-4 h-4" />,
      Link: <LinkIcon className="w-4 h-4" />,
    };
    return iconMap[iconName || ''] || <Square className="w-4 h-4" />;
  };

  const handleAddClass = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && classNameInput.trim()) {
      const newClassNames = [...classNames, classNameInput.trim()];
      setClassNames(newClassNames);
      setClassNameInput('');
      renameClass(newClassNames.join(' '));
    }
  };

  const handleRemoveClass = (index: number) => {
    const newClassNames = classNames.filter((_, i) => i !== index);
    setClassNames(newClassNames);
    renameClass(newClassNames.join(' '));
  };

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
            <div style={{ 
              padding: 'var(--space-2) var(--space-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span className="text-foreground">{getComponentIcon(selectedInstance.type)}</span>
                <span style={{ fontSize: '12px', fontWeight: 600 }} className="text-foreground">{selectedInstance.type}</span>
              </div>
            </div>

            {/* Class Name Input with States */}
            <div style={{ padding: 'var(--space-2)', borderBottom: '1px solid hsl(var(--border))' }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', alignItems: 'center', padding: 'var(--space-1)', background: 'hsl(var(--input))', border: '1px solid hsl(var(--border))', borderRadius: '4px', minHeight: '28px' }}>
                  {classNames.map((className, index) => (
                    <span key={index} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 6px', background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', borderRadius: '4px', fontSize: '11px' }}>
                      {className}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveClass(index)} />
                    </span>
                  ))}
                  <input
                    className="Input"
                    placeholder="Add class..."
                    value={classNameInput}
                    onChange={(e) => setClassNameInput(e.target.value)}
                    onKeyDown={handleAddClass}
                    style={{ 
                      flex: 1,
                      minWidth: '80px',
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      padding: '0',
                      height: '20px'
                    }}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="IconButton" style={{ width: '32px', height: '28px' }}>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setCurrentState('base')}>
                      Base
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setCurrentState('hover')}>
                      Hover
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentState('focus')}>
                      Focus Visible
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentState('focus-within')}>
                      Focus Within
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentState('active')}>
                      Active
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {currentState !== 'base' && (
                <div style={{ fontSize: '10px', color: 'hsl(var(--muted-foreground))', padding: '2px 0' }}>
                  State: {currentState}
                </div>
              )}
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
              <UnitInput
                value={computedStyles.marginTop || ''}
                onChange={(val) => updateStyle('marginTop', val)}
                placeholder="0"
                className="SpaceInput"
              />
            </div>

            {/* Middle row with left margin, padding box, right margin */}
            <div className="SpaceRow">
              <UnitInput
                value={computedStyles.marginLeft || ''}
                onChange={(val) => updateStyle('marginLeft', val)}
                placeholder="0"
                className="SpaceInput"
              />
              
              <div className="SpaceRing">
                <div className="SpacePaddingLabel">PADDING</div>
                
                {/* Top padding */}
                <UnitInput
                  value={computedStyles.paddingTop || ''}
                  onChange={(val) => updateStyle('paddingTop', val)}
                  placeholder="0"
                  className="SpaceInputSmall"
                />
                
                {/* Left and Right padding */}
                <div className="SpacePaddingRow">
                  <UnitInput
                    value={computedStyles.paddingLeft || ''}
                    onChange={(val) => updateStyle('paddingLeft', val)}
                    placeholder="0"
                    className="SpaceInputSmall"
                  />
                  <div style={{ flex: 1 }} />
                  <UnitInput
                    value={computedStyles.paddingRight || ''}
                    onChange={(val) => updateStyle('paddingRight', val)}
                    placeholder="0"
                    className="SpaceInputSmall"
                  />
                </div>
                
                {/* Bottom padding */}
                <UnitInput
                  value={computedStyles.paddingBottom || ''}
                  onChange={(val) => updateStyle('paddingBottom', val)}
                  placeholder="0"
                  className="SpaceInputSmall"
                />
              </div>

              <UnitInput
                value={computedStyles.marginRight || ''}
                onChange={(val) => updateStyle('marginRight', val)}
                placeholder="0"
                className="SpaceInput"
              />
            </div>

            {/* Bottom margin */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <UnitInput
                value={computedStyles.marginBottom || ''}
                onChange={(val) => updateStyle('marginBottom', val)}
                placeholder="0"
                className="SpaceInput"
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
            <UnitInput
              value={computedStyles.width || ''}
              onChange={(val) => updateStyle('width', val)}
              placeholder="auto"
            />
          </div>
          <div className="Col">
            <label className="Label">Height</label>
            <UnitInput
              value={computedStyles.height || ''}
              onChange={(val) => updateStyle('height', val)}
              placeholder="auto"
            />
          </div>
          <div className="Col">
            <label className="Label">Min Width</label>
            <UnitInput
              value={computedStyles.minWidth || ''}
              onChange={(val) => updateStyle('minWidth', val)}
              placeholder="auto"
            />
          </div>
          <div className="Col">
            <label className="Label">Min Height</label>
            <UnitInput
              value={computedStyles.minHeight || ''}
              onChange={(val) => updateStyle('minHeight', val)}
              placeholder="auto"
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
              <UnitInput
                value={computedStyles.fontSize || ''}
                onChange={(val) => updateStyle('fontSize', val)}
                placeholder="16px"
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
