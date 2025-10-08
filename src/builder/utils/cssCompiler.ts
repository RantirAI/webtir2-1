import { ShadowItem, TransformItem, FilterItem, TransitionItem, GradientItem, BackgroundLayer, StyleMetadata } from '../store/types';

export function compileShadows(shadows: ShadowItem[]): string {
  const enabled = shadows.filter(s => s.enabled);
  if (enabled.length === 0) return '';
  
  return enabled
    .map(s => {
      const inset = s.inset ? 'inset ' : '';
      return `${inset}${s.x} ${s.y} ${s.blur} ${s.spread} ${s.color}`;
    })
    .join(', ');
}

export function compileTransforms(transforms: TransformItem[]): string {
  const enabled = transforms.filter(t => t.enabled);
  if (enabled.length === 0) return '';
  
  return enabled
    .map(t => `${t.type}(${t.value}${t.unit})`)
    .join(' ');
}

export function compileFilters(filters: FilterItem[]): string {
  const enabled = filters.filter(f => f.enabled);
  if (enabled.length === 0) return '';
  
  return enabled
    .map(f => `${f.type}(${f.value}${f.unit})`)
    .join(' ');
}

export function compileTransitions(transitions: TransitionItem[]): string {
  const enabled = transitions.filter(t => t.enabled);
  if (enabled.length === 0) return '';
  
  const properties = enabled.map(t => t.property).join(', ');
  const durations = enabled.map(t => t.duration).join(', ');
  const easings = enabled.map(t => t.easing).join(', ');
  const delays = enabled.map(t => t.delay).join(', ');
  
  return JSON.stringify({ properties, durations, easings, delays });
}

export function compileGradient(gradient: GradientItem): string {
  if (!gradient.enabled || gradient.stops.length === 0) return '';
  
  const stops = gradient.stops
    .sort((a, b) => a.position - b.position)
    .map(s => `${s.color} ${s.position}%`)
    .join(', ');
  
  if (gradient.type === 'linear') {
    const angle = gradient.angle || '180deg';
    return `linear-gradient(${angle}, ${stops})`;
  } else {
    const shape = gradient.shape || 'circle';
    return `radial-gradient(${shape}, ${stops})`;
  }
}

export function compileBackgrounds(layers: BackgroundLayer[]): {
  image: string;
  size: string;
  position: string;
  repeat: string;
  attachment: string;
} {
  const enabled = layers.filter(l => l.enabled);
  
  if (enabled.length === 0) {
    return { image: '', size: '', position: '', repeat: '', attachment: '' };
  }
  
  const images: string[] = [];
  const sizes: string[] = [];
  const positions: string[] = [];
  const repeats: string[] = [];
  const attachments: string[] = [];
  
  enabled.forEach(layer => {
    if (layer.type === 'image' && layer.url) {
      images.push(`url(${layer.url})`);
      sizes.push(layer.size || 'auto');
      positions.push(layer.position || 'center');
      repeats.push(layer.repeat || 'no-repeat');
      attachments.push(layer.attachment || 'scroll');
    } else if (layer.type === 'gradient' && layer.gradient) {
      images.push(compileGradient(layer.gradient));
      sizes.push('auto');
      positions.push('center');
      repeats.push('no-repeat');
      attachments.push('scroll');
    }
  });
  
  return {
    image: images.join(', '),
    size: sizes.join(', '),
    position: positions.join(', '),
    repeat: repeats.join(', '),
    attachment: attachments.join(', '),
  };
}

export function compileMetadataToCSS(metadata: StyleMetadata): Record<string, string> {
  const css: Record<string, string> = {};
  
  if (metadata.shadows && metadata.shadows.length > 0) {
    const shadowValue = compileShadows(metadata.shadows);
    if (shadowValue) css['box-shadow'] = shadowValue;
  }
  
  if (metadata.transforms && metadata.transforms.length > 0) {
    const transformValue = compileTransforms(metadata.transforms);
    if (transformValue) css['transform'] = transformValue;
  }
  
  if (metadata.filters && metadata.filters.length > 0) {
    const filterValue = compileFilters(metadata.filters);
    if (filterValue) css['filter'] = filterValue;
  }
  
  if (metadata.backdropFilters && metadata.backdropFilters.length > 0) {
    const backdropValue = compileFilters(metadata.backdropFilters);
    if (backdropValue) css['backdrop-filter'] = backdropValue;
  }
  
  if (metadata.transitions && metadata.transitions.length > 0) {
    const enabled = metadata.transitions.filter(t => t.enabled);
    if (enabled.length > 0) {
      css['transition-property'] = enabled.map(t => t.property).join(', ');
      css['transition-duration'] = enabled.map(t => t.duration).join(', ');
      css['transition-timing-function'] = enabled.map(t => t.easing).join(', ');
      css['transition-delay'] = enabled.map(t => t.delay).join(', ');
    }
  }
  
  if (metadata.backgrounds && metadata.backgrounds.length > 0) {
    const bg = compileBackgrounds(metadata.backgrounds);
    if (bg.image) {
      css['background-image'] = bg.image;
      css['background-size'] = bg.size;
      css['background-position'] = bg.position;
      css['background-repeat'] = bg.repeat;
      css['background-attachment'] = bg.attachment;
    }
  }
  
  return css;
}
