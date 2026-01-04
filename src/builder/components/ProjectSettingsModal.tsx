import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Code, Settings, Palette, Library, Github, Trash2, Plus, Check } from 'lucide-react';
import { usePageStore } from '@/builder/store/usePageStore';
import { useProjectSettingsStore, themeColors, BuilderTheme, builderFonts, BuilderFont } from '@/builder/store/useProjectSettingsStore';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProjectSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  onProjectNameChange: (name: string) => void;
  faviconUrl: string;
  onFaviconChange: (url: string) => void;
  metaTitle: string;
  onMetaTitleChange: (title: string) => void;
  metaDescription: string;
  onMetaDescriptionChange: (description: string) => void;
  currentPageId?: string;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  open,
  onOpenChange,
  projectName,
  onProjectNameChange,
  faviconUrl,
  onFaviconChange,
  metaTitle,
  onMetaTitleChange,
  metaDescription,
  onMetaDescriptionChange,
}) => {
  const { getProjectCustomCode, updateProjectCustomCode } = usePageStore();
  const projectCode = getProjectCustomCode();
  const { 
    builderTheme, 
    setBuilderTheme,
    builderFont,
    setBuilderFont,
    customComponents,
    addCustomComponent,
    removeCustomComponent,
    githubLibraryUrl,
    setGithubLibraryUrl
  } = useProjectSettingsStore();
  
  const [newComponentName, setNewComponentName] = useState('');
  const [newComponentCode, setNewComponentCode] = useState('');

  const handleAddComponent = () => {
    if (newComponentName.trim() && newComponentCode.trim()) {
      addCustomComponent({
        name: newComponentName.trim(),
        code: newComponentCode.trim(),
      });
      setNewComponentName('');
      setNewComponentCode('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[80vh] overflow-y-auto p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-sm font-semibold">Project Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-8">
            <TabsTrigger value="general" className="gap-1 text-[10px] px-2 h-7">
              <Settings className="w-3 h-3" />
              General
            </TabsTrigger>
            <TabsTrigger value="theme" className="gap-1 text-[10px] px-2 h-7">
              <Palette className="w-3 h-3" />
              Theme
            </TabsTrigger>
            <TabsTrigger value="library" className="gap-1 text-[10px] px-2 h-7">
              <Library className="w-3 h-3" />
              Library
            </TabsTrigger>
            <TabsTrigger value="custom-code" className="gap-1 text-[10px] px-2 h-7">
              <Code className="w-3 h-3" />
              Code
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-3 py-3">
            <div className="space-y-1">
              <Label htmlFor="project-name" className="text-[11px]">Project Name</Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => onProjectNameChange(e.target.value)}
                placeholder="My Awesome Project"
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="favicon" className="text-[11px]">Favicon URL</Label>
              <div className="flex gap-1.5">
                <Input
                  id="favicon"
                  value={faviconUrl}
                  onChange={(e) => onFaviconChange(e.target.value)}
                  placeholder="https://example.com/favicon.ico"
                  className="h-8 text-xs"
                />
                <Button variant="outline" size="icon" className="h-8 w-8 shrink-0">
                  <Upload className="w-3 h-3" />
                </Button>
              </div>
              {faviconUrl && (
                <div className="mt-1.5">
                  <img src={faviconUrl} alt="Favicon preview" className="w-6 h-6 border rounded" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="meta-title" className="text-[11px]">Meta Title</Label>
              <Input
                id="meta-title"
                value={metaTitle}
                onChange={(e) => onMetaTitleChange(e.target.value)}
                placeholder="My Awesome Project"
                maxLength={60}
                className="h-8 text-xs"
              />
              <p className="text-[10px] text-muted-foreground">{metaTitle.length}/60</p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="meta-description" className="text-[11px]">Meta Description</Label>
              <Input
                id="meta-description"
                value={metaDescription}
                onChange={(e) => onMetaDescriptionChange(e.target.value)}
                placeholder="A brief description of your project"
                maxLength={160}
                className="h-8 text-xs"
              />
              <p className="text-[10px] text-muted-foreground">{metaDescription.length}/160</p>
            </div>
          </TabsContent>
          
          <TabsContent value="theme" className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label className="text-[11px]">Builder Color</Label>
              <p className="text-[10px] text-muted-foreground">Primary color for the builder interface</p>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(themeColors) as BuilderTheme[]).map((theme) => (
                <button
                  key={theme}
                  onClick={() => setBuilderTheme(theme)}
                  className={`flex items-center gap-2 p-2 rounded-md border transition-all ${
                    builderTheme === theme 
                      ? 'border-primary ring-1 ring-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div 
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: `hsl(${themeColors[theme].primary})` }}
                  />
                  <span className="text-[10px] font-medium">{themeColors[theme].name}</span>
                  {builderTheme === theme && (
                    <Check className="w-3 h-3 ml-auto text-primary" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="space-y-1.5 pt-2 border-t border-border">
              <Label className="text-[11px]">Builder Font</Label>
              <p className="text-[10px] text-muted-foreground">Font for the builder UI (sidebars, toolbars, buttons)</p>
            </div>
            
            <ScrollArea className="h-[200px] pr-3">
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(builderFonts) as BuilderFont[]).map((font) => (
                  <button
                    key={font}
                    onClick={() => setBuilderFont(font)}
                    className={`flex items-center justify-between p-2 rounded-md border transition-all text-left ${
                      builderFont === font 
                        ? 'border-primary ring-1 ring-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    style={{ fontFamily: builderFonts[font].family }}
                  >
                    <span className="text-[10px] font-medium truncate">{builderFonts[font].name}</span>
                    {builderFont === font && (
                      <Check className="w-3 h-3 shrink-0 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="library" className="space-y-3 py-3">
            <div className="space-y-1.5">
              <Label className="text-[11px]">Custom Components</Label>
              <p className="text-[10px] text-muted-foreground">Add reusable components to your library</p>
            </div>
            
            {/* GitHub Library Connection */}
            <div className="space-y-1">
              <Label htmlFor="github-lib" className="text-[11px] flex items-center gap-1">
                <Github className="w-3 h-3" />
                GitHub Library URL
              </Label>
              <Input
                id="github-lib"
                value={githubLibraryUrl}
                onChange={(e) => setGithubLibraryUrl(e.target.value)}
                placeholder="https://github.com/user/component-library"
                className="h-8 text-xs"
              />
            </div>
            
            {/* Custom Components List */}
            {customComponents.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-[11px]">Uploaded Components</Label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {customComponents.map((comp) => (
                    <div 
                      key={comp.id} 
                      className="flex items-center justify-between p-1.5 bg-muted/50 rounded text-[11px]"
                    >
                      <span className="font-medium">{comp.name}</span>
                      <button
                        onClick={() => removeCustomComponent(comp.id)}
                        className="p-0.5 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Add New Component */}
            <div className="space-y-1.5 pt-2 border-t border-border">
              <Label className="text-[11px]">Add New Component</Label>
              <Input
                value={newComponentName}
                onChange={(e) => setNewComponentName(e.target.value)}
                placeholder="Component name"
                className="h-8 text-xs"
              />
              <Textarea
                value={newComponentCode}
                onChange={(e) => setNewComponentCode(e.target.value)}
                placeholder="Paste component code here..."
                className="min-h-[60px] text-[10px] font-mono resize-none"
              />
              <Button 
                size="sm" 
                onClick={handleAddComponent}
                disabled={!newComponentName.trim() || !newComponentCode.trim()}
                className="h-7 text-[10px] gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Component
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="custom-code" className="space-y-3 py-3">
            <p className="text-[10px] text-muted-foreground">
              Add custom code for <strong>all pages</strong>. Use Page Settings for page-specific code.
            </p>
            
            <div className="space-y-1">
              <Label htmlFor="project-header-code" className="flex items-center gap-1.5 text-[11px]">
                <span className="text-[9px] font-mono bg-muted px-1.5 py-0.5 rounded">&lt;head&gt;</span>
                Header Code
              </Label>
              <Textarea
                id="project-header-code"
                value={projectCode.header}
                onChange={(e) => updateProjectCustomCode('header', e.target.value)}
                placeholder="<!-- Meta tags, scripts, stylesheets -->"
                className="font-mono text-[10px] min-h-[70px] resize-none"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="project-body-code" className="flex items-center gap-1.5 text-[11px]">
                <span className="text-[9px] font-mono bg-muted px-1.5 py-0.5 rounded">&lt;body&gt;</span>
                Body Start
              </Label>
              <Textarea
                id="project-body-code"
                value={projectCode.body}
                onChange={(e) => updateProjectCustomCode('body', e.target.value)}
                placeholder="<!-- Code at body start -->"
                className="font-mono text-[10px] min-h-[70px] resize-none"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="project-footer-code" className="flex items-center gap-1.5 text-[11px]">
                <span className="text-[9px] font-mono bg-muted px-1.5 py-0.5 rounded">&lt;/body&gt;</span>
                Footer Code
              </Label>
              <Textarea
                id="project-footer-code"
                value={projectCode.footer}
                onChange={(e) => updateProjectCustomCode('footer', e.target.value)}
                placeholder="<!-- Code before closing body -->"
                className="font-mono text-[10px] min-h-[70px] resize-none"
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
