import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigator } from './Navigator';
import { ComponentsPanel } from './ComponentsPanel';
import { Layers, Plus, FileText, ChevronRight, Home } from 'lucide-react';
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

  const handlePageClick = (page: string) => {
    setSelectedPageForSettings(page);
    setPageSettingsOpen(true);
  };

  return (
    <>
      <div 
        className="w-64 h-full border border-border rounded-lg shadow-xl flex flex-col overflow-hidden backdrop-blur-md bg-white/70 dark:bg-zinc-900/70"
      >
        <Tabs defaultValue="components" className="flex-1 flex flex-col">
          <TabsList className="w-full grid grid-cols-3 rounded-none border-b bg-transparent h-10 p-1 gap-1">
            <TabsTrigger 
              value="components" 
              className="gap-1 text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none"
            >
              <Plus className="w-3 h-3" />
              Components
            </TabsTrigger>
            <TabsTrigger 
              value="navigator" 
              className="gap-1 text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none"
            >
              <Layers className="w-3 h-3" />
              Layers
            </TabsTrigger>
            <TabsTrigger 
              value="pages" 
              className="gap-1 text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none"
            >
              <FileText className="w-3 h-3" />
              Pages
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
                  className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-zinc-800 ${
                    currentPage === page ? 'bg-[#F5F5F5] dark:bg-zinc-800' : ''
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
        <SheetContent side="left" className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Page Settings</SheetTitle>
            <SheetDescription>Configure settings for this page</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            {/* Page Name */}
            <div className="space-y-2">
              <Label htmlFor="page-name">Page Name</Label>
              <Input
                id="page-name"
                value={pageNames[selectedPageForSettings] || ''}
                onChange={(e) => onPageNameChange(selectedPageForSettings, e.target.value)}
              />
              <div className="flex items-center gap-2 mt-2">
                <Checkbox 
                  id="home-page"
                  checked={homePage === selectedPageForSettings}
                  onCheckedChange={(checked) => {
                    if (checked) onSetHomePage(selectedPageForSettings);
                  }}
                />
                <Label htmlFor="home-page" className="text-sm font-normal">
                  Make "{pageNames[selectedPageForSettings]}" the home page
                </Label>
              </div>
            </div>

            {/* Path */}
            <div className="space-y-2">
              <Label htmlFor="page-path">Path</Label>
              <Input
                id="page-path"
                value={`/${pageNames[selectedPageForSettings]?.toLowerCase().replace(/\s+/g, '-') || ''}`}
                disabled
                className="bg-muted"
              />
            </div>

            {/* Status Code */}
            <div className="space-y-2">
              <Label htmlFor="status-code">Status Code</Label>
              <Input
                id="status-code"
                value={statusCode}
                onChange={(e) => setStatusCode(e.target.value)}
                placeholder="200"
              />
            </div>

            {/* Redirect */}
            <div className="space-y-2">
              <Label htmlFor="redirect">Redirect</Label>
              <Input
                id="redirect"
                value={redirect}
                onChange={(e) => setRedirect(e.target.value)}
                placeholder="/another-path"
              />
              <p className="text-xs text-muted-foreground">Dynamic routing and redirect are a part of the CMS functionality.</p>
            </div>

            {/* Document Type */}
            <div className="space-y-2">
              <Label htmlFor="document-type">Document Type</Label>
              <Select defaultValue="html">
                <SelectTrigger id="document-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Search Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-1">Search</h3>
                <p className="text-xs text-muted-foreground">Optimize the way this page appears in search engine results pages.</p>
              </div>

              {/* Search Result Preview */}
              <div className="space-y-2">
                <Label>Search Result Preview</Label>
                <div className="border rounded-lg p-3 bg-muted/30">
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-primary rounded-sm flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        https://marketplace-ai-startup-office...
                      </p>
                      <p className="text-sm text-primary font-medium mt-0.5">
                        {pageMetaTitle || 'Untitled'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {pageMetaDescription || 'No description provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="meta-title">Title</Label>
                <Input
                  id="meta-title"
                  value={pageMetaTitle}
                  onChange={(e) => setPageMetaTitle(e.target.value)}
                  placeholder="Untitled"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="meta-description">Description</Label>
                <Textarea
                  id="meta-description"
                  value={pageMetaDescription}
                  onChange={(e) => setPageMetaDescription(e.target.value)}
                  placeholder="Enter page description"
                  rows={3}
                />
              </div>

              {/* Exclude from search */}
              <div className="flex items-center gap-2">
                <Checkbox id="exclude-search" />
                <Label htmlFor="exclude-search" className="text-sm font-normal">
                  Exclude this page from search results
                </Label>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="en-US"
                />
              </div>
            </div>

            <Separator />

            {/* Social Image */}
            <div className="space-y-2">
              <Label>Social Image</Label>
              <p className="text-xs text-muted-foreground mb-2">
                This image appears when you share a link to this page on social media sites.
              </p>
              <Input placeholder="https://www.url.com" />
              <Button variant="outline" size="sm" className="w-full mt-2">
                Choose Image From Assets
              </Button>
            </div>

            <Separator />

            {/* Custom Code */}
            <div className="space-y-2">
              <Label htmlFor="custom-code">Custom Code</Label>
              <Textarea
                id="custom-code"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="Add custom HTML, CSS, or JavaScript"
                rows={6}
                className="font-mono text-xs"
              />
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => {
                  onDuplicatePage(selectedPageForSettings);
                  setPageSettingsOpen(false);
                }}
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </Button>
              <Button
                variant="destructive"
                className="flex items-center gap-2"
                onClick={() => {
                  onDeletePage(selectedPageForSettings);
                  setPageSettingsOpen(false);
                }}
                disabled={pages.length === 1}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
