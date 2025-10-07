import React from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { useStyleStore } from '../store/useStyleStore';
import '../styles/style-panel.css';

export const StylePanel: React.FC = () => {
  const { getSelectedInstance, updateInstance } = useBuilderStore();
  const { setStyle, getComputedStyles, styleSources, createStyleSource, nextLocalClassName, renameStyleSource } = useStyleStore();
  const selectedInstance = getSelectedInstance();

  if (!selectedInstance) {
    return (
      <div className="StylePanel">
        <div className="Section" style={{ textAlign: 'center', color: 'var(--muted)' }}>
          Select an element to edit its style
        </div>
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

  const classes = selectedInstance.styleSourceIds
    ?.map((id) => ({
      id,
      name: styleSources[id]?.name || id,
      isActive: id === styleSourceId,
    }))
    .filter(Boolean) || [];

  const isFlexDisplay = computedStyles.display === 'flex';

  const renameClass = (newName: string) => {
    if (!styleSourceId) return;
    renameStyleSource(styleSourceId, newName);
  };

  return (
    <div className="StylePanel">
      {/* Element Type & Class Name */}
      <section className="Section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>{selectedInstance.type}</span>
          <button style={{ 
            background: 'transparent', 
            border: 'none', 
            color: 'var(--text)',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '4px'
          }}>⋯</button>
        </div>
        <div className="Col">
          <label className="Label">Class Name</label>
          <input
            className="Input"
            value={styleSource?.name || ''}
            onChange={(e) => renameClass(e.target.value)}
            placeholder="Enter class name"
          />
        </div>
      </section>

      {/* Style Sources */}
      <section className="Section">
        <div className="SectionTitle">Style Sources</div>
        <div className="Chips">
          {classes.map((c) => (
            <div key={c.id} className="Chip">
              <span>{c.name}</span>
              {c.isActive && <span className="Dot" />}
            </div>
          ))}
        </div>
      </section>

      {/* Layout */}
      <section className="Section">
        <div className="SectionTitle">Layout</div>

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
              {/* Align Grid */}
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

              {/* Flex Controls Column */}
              <div className="FlexControlsColumn">
                <div className="Col">
                  <label className="Label">Direction</label>
                  <select
                    className="Select"
                    value={computedStyles.flexDirection || 'row'}
                    onChange={(e) => updateStyle('flexDirection', e.target.value)}
                  >
                    <option value="row">row</option>
                    <option value="row-reverse">row-reverse</option>
                    <option value="column">column</option>
                    <option value="column-reverse">column-reverse</option>
                  </select>
                </div>

                <div className="Col">
                  <label className="Label">Justify</label>
                  <select
                    className="Select"
                    value={computedStyles.justifyContent || 'flex-start'}
                    onChange={(e) => updateStyle('justifyContent', e.target.value)}
                  >
                    <option value="flex-start">flex-start</option>
                    <option value="center">center</option>
                    <option value="flex-end">flex-end</option>
                    <option value="space-between">space-between</option>
                    <option value="space-around">space-around</option>
                    <option value="space-evenly">space-evenly</option>
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
                    <option value="flex-start">flex-start</option>
                    <option value="center">center</option>
                    <option value="flex-end">flex-end</option>
                    <option value="baseline">baseline</option>
                  </select>
                </div>

                <div className="Col">
                  <label className="Label">Gap</label>
                  <div className="Row">
                    <input
                      className="Input"
                      type="text"
                      value={computedStyles.gap || ''}
                      onChange={(e) => updateStyle('gap', e.target.value)}
                      placeholder="0"
                      style={{ flex: 1 }}
                    />
                    <span className="Label" style={{ minWidth: '40px' }}>REM</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Space */}
      <section className="Section">
        <div className="SectionTitle">Space</div>
        <div className="SpaceBox">
          <div className="SpaceRing">
            <div className="SpaceLabelCenter">PADDING</div>
            {/* Padding values inside */}
            <div style={{ 
              position: 'absolute',
              top: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '11px',
              color: 'hsl(12, 76%, 61%)',
              fontWeight: 600
            }}>
              {computedStyles.paddingTop || '0'}
            </div>
            <div style={{ 
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '11px',
              color: 'hsl(12, 76%, 61%)',
              fontWeight: 600
            }}>
              {computedStyles.paddingRight || '0'}
            </div>
            <div style={{ 
              position: 'absolute',
              bottom: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '11px',
              color: 'hsl(12, 76%, 61%)',
              fontWeight: 600
            }}>
              {computedStyles.paddingBottom || '0'}
            </div>
            <div style={{ 
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '11px',
              color: 'hsl(12, 76%, 61%)',
              fontWeight: 600
            }}>
              {computedStyles.paddingLeft || '0'}
            </div>
          </div>

          {/* Margin label */}
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            fontSize: '10px',
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            MARGIN
          </div>

          {/* Margin fields with units */}
          <div className="SpaceField" data-pos="top">
            <div className="Row" style={{ gap: '2px' }}>
              <input
                className="Input"
                placeholder="0"
                value={computedStyles.marginTop?.replace(/[a-z%]/gi, '') || ''}
                onChange={(e) => updateStyle('marginTop', e.target.value + 'px')}
                style={{ flex: 1, minWidth: 0 }}
              />
              <span className="Label" style={{ fontSize: '9px', minWidth: '24px', textAlign: 'center' }}>PX</span>
            </div>
          </div>
          <div className="SpaceField" data-pos="right">
            <div className="Row" style={{ gap: '2px' }}>
              <input
                className="Input"
                placeholder="0"
                value={computedStyles.marginRight?.replace(/[a-z%]/gi, '') || ''}
                onChange={(e) => updateStyle('marginRight', e.target.value + 'px')}
                style={{ flex: 1, minWidth: 0 }}
              />
              <span className="Label" style={{ fontSize: '9px', minWidth: '24px', textAlign: 'center' }}>PX</span>
            </div>
          </div>
          <div className="SpaceField" data-pos="bottom">
            <div className="Row" style={{ gap: '2px' }}>
              <input
                className="Input"
                placeholder="0"
                value={computedStyles.marginBottom?.replace(/[a-z%]/gi, '') || ''}
                onChange={(e) => updateStyle('marginBottom', e.target.value + 'px')}
                style={{ flex: 1, minWidth: 0 }}
              />
              <span className="Label" style={{ fontSize: '9px', minWidth: '24px', textAlign: 'center' }}>PX</span>
            </div>
          </div>
          <div className="SpaceField" data-pos="left">
            <div className="Row" style={{ gap: '2px' }}>
              <input
                className="Input"
                placeholder="0"
                value={computedStyles.marginLeft?.replace(/[a-z%]/gi, '') || ''}
                onChange={(e) => updateStyle('marginLeft', e.target.value + 'px')}
                style={{ flex: 1, minWidth: 0 }}
              />
              <span className="Label" style={{ fontSize: '9px', minWidth: '24px', textAlign: 'center' }}>PX</span>
            </div>
          </div>

          {/* Corner padding inputs with units */}
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '4px',
            fontSize: '11px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <input
                className="Input"
                placeholder="0"
                value={computedStyles.paddingTop?.replace(/[a-z%]/gi, '') || ''}
                onChange={(e) => updateStyle('paddingTop', e.target.value + 'px')}
                style={{ width: '48px' }}
              />
              <span className="Label" style={{ fontSize: '9px' }}>PX</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <input
                className="Input"
                placeholder="0"
                value={computedStyles.paddingRight?.replace(/[a-z%]/gi, '') || ''}
                onChange={(e) => updateStyle('paddingRight', e.target.value + 'px')}
                style={{ width: '48px' }}
              />
              <span className="Label" style={{ fontSize: '9px' }}>PX</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <input
                className="Input"
                placeholder="0"
                value={computedStyles.paddingBottom?.replace(/[a-z%]/gi, '') || ''}
                onChange={(e) => updateStyle('paddingBottom', e.target.value + 'px')}
                style={{ width: '48px' }}
              />
              <span className="Label" style={{ fontSize: '9px' }}>PX</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <input
                className="Input"
                placeholder="0"
                value={computedStyles.paddingLeft?.replace(/[a-z%]/gi, '') || ''}
                onChange={(e) => updateStyle('paddingLeft', e.target.value + 'px')}
                style={{ width: '48px' }}
              />
              <span className="Label" style={{ fontSize: '9px' }}>PX</span>
            </div>
          </div>
        </div>
      </section>

      {/* Size */}
      <section className="Section">
        <div className="SectionTitle">Size</div>
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
      </section>

      {/* Typography */}
      <section className="Section">
        <div className="SectionTitle">Typography</div>
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

          <div className="Col">
            <label className="Label">Color</label>
            <input
              className="Input"
              placeholder="hsl(var(--foreground))"
              value={computedStyles.color || ''}
              onChange={(e) => updateStyle('color', e.target.value)}
            />
          </div>

          <div className="Col">
            <label className="Label">Text Align</label>
            <select
              className="Select"
              value={computedStyles.textAlign || 'left'}
              onChange={(e) => updateStyle('textAlign', e.target.value)}
            >
              <option value="left">left</option>
              <option value="center">center</option>
              <option value="right">right</option>
              <option value="justify">justify</option>
            </select>
          </div>
        </div>
      </section>

      {/* Backgrounds */}
      <section className="Section">
        <div className="SectionTitle">Backgrounds</div>
        <div className="Col">
          <label className="Label">Background Color</label>
          <input
            className="Input"
            placeholder="transparent"
            value={computedStyles.backgroundColor || ''}
            onChange={(e) => updateStyle('backgroundColor', e.target.value)}
          />
        </div>
      </section>

      {/* Borders */}
      <section className="Section">
        <div className="SectionTitle">Borders</div>
        <div className="Col">
          <label className="Label">Border</label>
          <input
            className="Input"
            placeholder="1px solid #000"
            value={computedStyles.border || ''}
            onChange={(e) => updateStyle('border', e.target.value)}
          />
          <label className="Label">Border Radius</label>
          <input
            className="Input"
            placeholder="0px"
            value={computedStyles.borderRadius || ''}
            onChange={(e) => updateStyle('borderRadius', e.target.value)}
          />
        </div>
      </section>
    </div>
  );
};
