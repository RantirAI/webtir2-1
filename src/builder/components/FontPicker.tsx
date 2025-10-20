import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Popular Google Fonts with their available weights
const GOOGLE_FONTS = [
  { name: 'Inter', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Roboto', weights: [100, 300, 400, 500, 700, 900] },
  { name: 'Open Sans', weights: [300, 400, 500, 600, 700, 800] },
  { name: 'Lato', weights: [100, 300, 400, 700, 900] },
  { name: 'Montserrat', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Poppins', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Playfair Display', weights: [400, 500, 600, 700, 800, 900] },
  { name: 'Raleway', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Merriweather', weights: [300, 400, 700, 900] },
  { name: 'Source Sans Pro', weights: [200, 300, 400, 600, 700, 900] },
  { name: 'Nunito', weights: [200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Ubuntu', weights: [300, 400, 500, 700] },
  { name: 'Oswald', weights: [200, 300, 400, 500, 600, 700] },
  { name: 'PT Sans', weights: [400, 700] },
  { name: 'Work Sans', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
];

interface FontPickerProps {
  value?: string;
  weight?: string;
  onChange: (fontFamily: string) => void;
  onWeightChange: (weight: string) => void;
}

export const FontPicker: React.FC<FontPickerProps> = ({ value, weight, onChange, onWeightChange }) => {
  const [customFonts, setCustomFonts] = useState<Array<{ name: string; url: string }>>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [fontName, setFontName] = useState('');
  const [fontFile, setFontFile] = useState<File | null>(null);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());

  // Get current font info
  const currentFontName = value?.replace(/['"]/g, '').split(',')[0].trim() || '';
  const currentFont = GOOGLE_FONTS.find(f => f.name === currentFontName);
  const isCustomFont = customFonts.some(f => f.name === currentFontName);

  // Get available weights for current font
  const availableWeights = currentFont?.weights || [100, 200, 300, 400, 500, 600, 700, 800, 900];

  // Load Google Font dynamically
  const loadGoogleFont = (fontName: string) => {
    if (loadedFonts.has(fontName)) return;

    const font = GOOGLE_FONTS.find(f => f.name === fontName);
    if (!font) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@${font.weights.join(';')}&display=swap`;
    document.head.appendChild(link);

    setLoadedFonts(prev => new Set([...prev, fontName]));
  };

  // Load custom font
  const handleCustomFontUpload = () => {
    if (!fontName.trim() || !fontFile) return;

    const url = URL.createObjectURL(fontFile);
    const fontFace = new FontFace(fontName, `url(${url})`);
    
    fontFace.load().then((loadedFace) => {
      document.fonts.add(loadedFace);
      setCustomFonts(prev => [...prev, { name: fontName, url }]);
      onChange(`"${fontName}", sans-serif`);
      setFontName('');
      setFontFile(null);
      setIsUploadOpen(false);
    });
  };

  const handleRemoveCustomFont = (fontName: string) => {
    setCustomFonts(prev => prev.filter(f => f.name !== fontName));
    if (currentFontName === fontName) {
      onChange('inherit');
    }
  };

  const handleFontSelect = (fontName: string) => {
    if (fontName === 'inherit') {
      onChange('inherit');
      return;
    }

    loadGoogleFont(fontName);
    onChange(`"${fontName}", sans-serif`);
    
    // Set default weight if current weight is not available
    const font = GOOGLE_FONTS.find(f => f.name === fontName);
    if (font && weight && !font.weights.includes(parseInt(weight))) {
      onWeightChange('400');
    }
  };

  return (
    <div className="space-y-2">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '4px', alignItems: 'center' }}>
        <Select value={currentFontName || 'inherit'} onValueChange={handleFontSelect}>
          <SelectTrigger className="h-6 text-xs bg-[#F5F5F5] dark:bg-[#09090b] border-input">
            <SelectValue placeholder="Select font" className="placeholder:text-muted-foreground placeholder:opacity-70">
              {currentFontName ? (
                <span style={{ fontFamily: currentFontName === 'inherit' ? 'inherit' : `"${currentFontName}", sans-serif` }}>
                  {currentFontName === 'inherit' ? 'Default' : currentFontName}
                </span>
              ) : 'Default'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[300px] bg-background border-border z-50">
            <SelectItem value="inherit">
              <span style={{ fontFamily: 'inherit' }}>Default</span>
            </SelectItem>
            
            {GOOGLE_FONTS.map(font => (
              <SelectItem 
                key={font.name} 
                value={font.name}
                onMouseEnter={() => loadGoogleFont(font.name)}
              >
                <span style={{ fontFamily: `"${font.name}", sans-serif` }}>
                  {font.name}
                </span>
              </SelectItem>
            ))}

            {customFonts.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t">
                  Custom Fonts
                </div>
                {customFonts.map(font => (
                  <div key={font.name} className="flex items-center justify-between px-2 py-1.5 hover:bg-accent">
                    <SelectItem value={font.name} className="flex-1">
                      <span style={{ fontFamily: `"${font.name}", sans-serif` }}>
                        {font.name}
                      </span>
                    </SelectItem>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCustomFont(font.name);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </>
            )}
          </SelectContent>
        </Select>

        <Popover open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-6 w-8 p-0 bg-[#F5F5F5] dark:bg-[#09090b] border-input hover:bg-accent">
              <Upload className="h-3.5 w-3.5 text-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="end">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold mb-1">Upload Custom Font</h4>
                <p className="text-xs text-muted-foreground">
                  Upload a .woff, .woff2, .ttf, or .otf file
                </p>
              </div>
              
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Font name"
                  value={fontName}
                  onChange={(e) => setFontName(e.target.value)}
                  className="w-full h-8 px-2 text-xs border rounded-md bg-background"
                />
                
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".woff,.woff2,.ttf,.otf"
                    onChange={(e) => setFontFile(e.target.files?.[0] || null)}
                    className="text-xs"
                  />
                </div>
              </div>

              <Button
                onClick={handleCustomFontUpload}
                disabled={!fontName.trim() || !fontFile}
                className="w-full h-8 text-xs"
                size="sm"
              >
                Upload Font
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Weight selector */}
      <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: '4px', alignItems: 'center' }}>
        <label className="Label" style={{ fontSize: '10px' }}>Weight</label>
        <select
          className="Select"
          value={weight || '400'}
          onChange={(e) => onWeightChange(e.target.value)}
          disabled={!currentFont && !isCustomFont}
        >
          {availableWeights.map(w => (
            <option key={w} value={w}>
              {w === 100 && 'Thin'}
              {w === 200 && 'Extra Light'}
              {w === 300 && 'Light'}
              {w === 400 && 'Normal'}
              {w === 500 && 'Medium'}
              {w === 600 && 'Semibold'}
              {w === 700 && 'Bold'}
              {w === 800 && 'Extra Bold'}
              {w === 900 && 'Black'}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
