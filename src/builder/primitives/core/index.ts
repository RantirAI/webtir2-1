/**
 * Core Primitives Index
 * 
 * This file exports all primitives using the split-file architecture.
 * Each primitive has:
 * - .core.tsx: Locked core logic (DO NOT MODIFY)
 * - .editable.tsx: User-customizable layer (SAFE TO MODIFY)
 */

// Types
export * from './types';

// Text Primitive
export { TextCore } from './Text.core';
export { TextEditable, textCustomStyles, textCustomClassName, renderTextContent } from './Text.editable';

// Re-export editable components as the default primitives
export { TextEditable as Text } from './Text.editable';
