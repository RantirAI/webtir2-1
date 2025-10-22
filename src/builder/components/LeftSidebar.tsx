import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigator } from './Navigator';
import { ComponentsPanel } from './ComponentsPanel';
import { Layers, Plus, FileText, ChevronRight, Home, Box, Sparkles } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Copy, Trash2 } from 'lucide-react';

interface LeftSidebarProps {
  pages: string[];
  currentPage: string;
  pageNames: Record<string, string>;
  onPageChange: (page: string) => void;
  onPageNameChange: (pageId: string, newName: string) => void;
  onDeletePage: (pageId: string) => void;
  onDuplicatePage: (pageId: string) => void;
  onSetHomePage: (pageId: string) => void;
  homePage: string;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  pages,
  currentPage,
  pageNames,
  onPageChange,
  onPageNameChange,
  onDeletePage,
  onDuplicatePage,
  onSetHomePage,
  homePage,
}) => {
  const [pageSettingsOpen, setPageSettingsOpen] = useState(false);
  const [selectedPageForSettings, setSelectedPageForSettings] = useState<string>('');
  const [pageMetaTitle, setPageMetaTitle] = useState('');
  const [pageMetaDescription, setPageMetaDescription] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [statusCode, setStatusCode] = useState('200');
  const [redirect, setRedirect] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('builder-sidebar-tab') || 'components';
  });

  useEffect(() => {
    localStorage.setItem('builder-sidebar-tab', activeTab);
  }, [activeTab]);

  const handlePageClick = (page: string) => {
    setSelectedPageForSettings(page);
    setPageSettingsOpen(true);
  };

  return (
    <>
      <div 
        className="w-64 h-full border border-border rounded-lg shadow-xl flex flex-col overflow-hidden bg-background"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full flex rounded-none border-b bg-transparent h-10 p-1 gap-1 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent justify-start flex-shrink-0">
            <TabsTrigger 
              value="components" 
              className="text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none flex items-center gap-1 whitespace-nowrap px-3 flex-shrink-0"
            >
              <Box className="w-3 h-3" />
              <span>Components</span>
            </TabsTrigger>
            <TabsTrigger 
              value="navigator" 
              className="text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none flex items-center gap-1 whitespace-nowrap px-3 flex-shrink-0"
            >
              <Layers className="w-3 h-3" />
              <span>Layers</span>
            </TabsTrigger>
            <TabsTrigger 
              value="pages" 
              className="text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none flex items-center gap-1 whitespace-nowrap px-3 flex-shrink-0"
            >
              <FileText className="w-3 h-3" />
              <span>Pages</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="components" className="flex-1 m-0">
            <ComponentsPanel />
          </TabsContent>

          <TabsContent value="navigator" className="flex-1 m-0">
            <Navigator />
          </TabsContent>

          <TabsContent value="pages" className="flex-1 m-0 p-0 overflow-y-auto">
            <div className="p-2">
              {pages.map((page) => (
                <div
                  key={page}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-accent ${
                    currentPage === page ? 'bg-accent' : ''
                  }`}
                  onClick={() => onPageChange(page)}
                >
                  <div className="flex items-center gap-2">
                    {homePage === page ? (
                      <Home className="w-4 h-4 text-primary" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    <span className="text-xs">{pageNames[page] || page}</span>
                  </div>
                  <ChevronRight 
                    className="w-4 h-4 text-muted-foreground hover:text-foreground" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePageClick(page);
                    }}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Page Settings Drawer - from left side */}
      <Sheet open={pageSettingsOpen} onOpenChange={setPageSettingsOpen}>
        <SheetContent side="left" className="w-[340px] overflow-y-auto p-4">
          <SheetHeader className="pb-3 space-y-1">
            <SheetTitle className="text-sm">Page Settings</SheetTitle>
            <SheetDescription className="text-xs">Configure settings for this page</SheetDescription>
          </SheetHeader>
          <div className="mt-3 space-y-3">
            {/* Page Name */}
            <div className="space-y-1.5">
              <Label htmlFor="page-name" className="text-xs">Page Name</Label>
              <Input
                id="page-name"
                value={pageNames[selectedPageForSettings] || ''}
                onChange={(e) => onPageNameChange(selectedPageForSettings, e.target.value)}
                className="h-7 text-xs"
              />
              <div className="flex items-center gap-2 mt-1.5">
                <Checkbox 
                  id="home-page"
                  checked={homePage === selectedPageForSettings}
                  onCheckedChange={(checked) => {
                    if (checked) onSetHomePage(selectedPageForSettings);
                  }}
                  className="h-3 w-3"
                />
                <Label htmlFor="home-page" className="text-xs font-normal">
                  Make "{pageNames[selectedPageForSettings]}" the home page
                </Label>
              </div>
            </div>

            {/* Path */}
            <div className="space-y-1.5">
              <Label htmlFor="page-path" className="text-xs">Path</Label>
              <Input
                id="page-path"
                value={`/${pageNames[selectedPageForSettings]?.toLowerCase().replace(/\s+/g, '-') || ''}`}
                disabled
                className="bg-muted h-7 text-xs"
              />
            </div>

            {/* Status Code */}
            <div className="space-y-1.5">
              <Label htmlFor="status-code" className="text-xs">Status Code</Label>
              <Input
                id="status-code"
                value={statusCode}
                onChange={(e) => setStatusCode(e.target.value)}
                placeholder="200"
                className="h-7 text-xs"
              />
            </div>

            {/* Redirect */}
            <div className="space-y-1.5">
              <Label htmlFor="redirect" className="text-xs">Redirect</Label>
              <Input
                id="redirect"
                value={redirect}
                onChange={(e) => setRedirect(e.target.value)}
                placeholder="/another-path"
                className="h-7 text-xs"
              />
              <p className="text-[10px] text-muted-foreground">Dynamic routing and redirect are a part of the CMS functionality.</p>
            </div>

            {/* Document Type */}
            <div className="space-y-1.5">
              <Label htmlFor="document-type" className="text-xs">Document Type</Label>
              <Select defaultValue="html">
                <SelectTrigger id="document-type" className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator className="my-3" />

            {/* Search Section */}
            <div className="space-y-2.5">
              <div>
                <h3 className="text-xs font-semibold mb-0.5">Search</h3>
                <p className="text-[10px] text-muted-foreground">Optimize the way this page appears in search engine results pages.</p>
              </div>

              {/* Search Result Preview */}
              <div className="space-y-1.5">
                <Label className="text-xs">Search Result Preview</Label>
                <div className="border rounded p-2 bg-muted/30">
                  <div className="flex items-start gap-1.5">
                    <div className="w-3 h-3 bg-primary rounded-sm flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-muted-foreground truncate">
                        https://marketplace-ai-startup-office...
                      </p>
                      <p className="text-xs text-primary font-medium mt-0.5">
                        {pageMetaTitle || 'Untitled'}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                        {pageMetaDescription || 'No description provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="meta-title" className="text-xs">Title</Label>
                <Input
                  id="meta-title"
                  value={pageMetaTitle}
                  onChange={(e) => setPageMetaTitle(e.target.value)}
                  placeholder="Untitled"
                  className="h-7 text-xs"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="meta-description" className="text-xs">Description</Label>
                <Textarea
                  id="meta-description"
                  value={pageMetaDescription}
                  onChange={(e) => setPageMetaDescription(e.target.value)}
                  placeholder="Enter page description"
                  rows={3}
                  className="text-xs resize-none"
                />
              </div>

              {/* Exclude from search */}
              <div className="flex items-center gap-2">
                <Checkbox id="exclude-search" className="h-3 w-3" />
                <Label htmlFor="exclude-search" className="text-xs font-normal">
                  Exclude this page from search results
                </Label>
              </div>

              {/* Language */}
              <div className="space-y-1.5">
                <Label htmlFor="language" className="text-xs">Language</Label>
                <Input
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="en-US"
                  className="h-7 text-xs"
                />
              </div>
            </div>

            <Separator className="my-3" />

            {/* Social Image */}
            <div className="space-y-1.5">
              <Label className="text-xs">Social Image</Label>
              <p className="text-[10px] text-muted-foreground mb-1.5">
                This image appears when you share a link to this page on social media sites.
              </p>
              <Input placeholder="https://www.url.com" className="h-7 text-xs" />
              <Button variant="outline" size="sm" className="w-full mt-1.5 h-7 text-xs">
                Choose Image From Assets
              </Button>
            </div>

            <Separator className="my-3" />

            {/* Custom Code */}
            <div className="space-y-1.5">
              <Label htmlFor="custom-code" className="text-xs">Custom Code</Label>
              <Textarea
                id="custom-code"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="Add custom HTML, CSS, or JavaScript"
                rows={4}
                className="font-mono text-[10px] resize-none"
              />
            </div>

            <Separator className="my-3" />

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex items-center gap-1.5 h-7 text-xs"
                onClick={() => {
                  onDuplicatePage(selectedPageForSettings);
                  setPageSettingsOpen(false);
                }}
              >
                <Copy className="w-3 h-3" />
                Duplicate
              </Button>
              <Button
                variant="destructive"
                className="flex items-center gap-1.5 h-7 text-xs"
                onClick={() => {
                  onDeletePage(selectedPageForSettings);
                  setPageSettingsOpen(false);
                }}
                disabled={pages.length === 1}
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
