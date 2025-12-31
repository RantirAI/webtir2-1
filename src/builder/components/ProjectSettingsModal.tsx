import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Code, Settings } from 'lucide-react';
import { usePageStore } from '@/builder/store/usePageStore';

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
  currentPageId,
}) => {
  const { getPageCustomCode, updatePageCustomCode, getCurrentPage } = usePageStore();
  const currentPage = getCurrentPage();
  const pageId = currentPageId || currentPage?.id || 'page-1';
  const customCode = getPageCustomCode(pageId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general" className="gap-2">
              <Settings className="w-4 h-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="custom-code" className="gap-2">
              <Code className="w-4 h-4" />
              Custom Code
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => onProjectNameChange(e.target.value)}
                placeholder="My Awesome Project"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="favicon">Favicon URL</Label>
              <div className="flex gap-2">
                <Input
                  id="favicon"
                  value={faviconUrl}
                  onChange={(e) => onFaviconChange(e.target.value)}
                  placeholder="https://example.com/favicon.ico"
                />
                <Button variant="outline" size="icon">
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
              {faviconUrl && (
                <div className="mt-2">
                  <img src={faviconUrl} alt="Favicon preview" className="w-8 h-8 border rounded" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta-title">Meta Title</Label>
              <Input
                id="meta-title"
                value={metaTitle}
                onChange={(e) => onMetaTitleChange(e.target.value)}
                placeholder="My Awesome Project"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">{metaTitle.length}/60 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta-description">Meta Description</Label>
              <Input
                id="meta-description"
                value={metaDescription}
                onChange={(e) => onMetaDescriptionChange(e.target.value)}
                placeholder="A brief description of your project"
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground">{metaDescription.length}/160 characters</p>
            </div>
          </TabsContent>
          
          <TabsContent value="custom-code" className="space-y-6 py-4">
            <div className="text-sm text-muted-foreground mb-4">
              Add custom code to the current page ({currentPage?.name || 'Page 1'}). 
              This code will be visible in the code editor and included in exports.
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="header-code" className="flex items-center gap-2">
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">&lt;head&gt;</span>
                Header Code
              </Label>
              <Textarea
                id="header-code"
                value={customCode.header}
                onChange={(e) => updatePageCustomCode(pageId, 'header', e.target.value)}
                placeholder="<!-- Add meta tags, scripts, stylesheets, etc. -->"
                className="font-mono text-xs min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                Code injected into the &lt;head&gt; section (meta tags, stylesheets, scripts)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body-code" className="flex items-center gap-2">
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">&lt;body&gt;</span>
                Body Start Code
              </Label>
              <Textarea
                id="body-code"
                value={customCode.body}
                onChange={(e) => updatePageCustomCode(pageId, 'body', e.target.value)}
                placeholder="<!-- Code at the start of body -->"
                className="font-mono text-xs min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                Code injected at the beginning of &lt;body&gt; (tracking scripts, noscript tags)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="footer-code" className="flex items-center gap-2">
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">&lt;/body&gt;</span>
                Footer Code
              </Label>
              <Textarea
                id="footer-code"
                value={customCode.footer}
                onChange={(e) => updatePageCustomCode(pageId, 'footer', e.target.value)}
                placeholder="<!-- Code before closing body tag -->"
                className="font-mono text-xs min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                Code injected before the closing &lt;/body&gt; tag (analytics, chat widgets)
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
