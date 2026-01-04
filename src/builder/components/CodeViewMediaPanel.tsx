import React, { useRef, useState } from 'react';
import { 
  useMediaStore, 
  MediaAsset, 
  MediaFolder,
  formatFileSize 
} from '../store/useMediaStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
  Search,
  Plus,
  Trash2,
  Download,
  Image as ImageIcon,
  Video,
  Music,
  File,
  Folder,
  FolderOpen,
  FolderPlus,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Check,
  X,
  Link,
  Copy,
} from 'lucide-react';

const typeIcons: Record<string, React.ElementType> = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  document: File,
  archive: File,
  font: File,
  code: File,
  other: File,
};

interface CodeViewMediaPanelProps {
  selectedPath?: string;
}

export const CodeViewMediaPanel: React.FC<CodeViewMediaPanelProps> = ({ selectedPath }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    assets,
    folders,
    currentFolderId,
    addAsset,
    addFolder,
    removeFolder,
    renameFolder,
    removeAssets,
    getFilteredAssets,
    getFoldersInParent,
    setCurrentFolder,
  } = useMediaStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  
  const filteredAssets = getFilteredAssets().filter(a => 
    !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const currentFolders = getFoldersInParent(currentFolderId).filter(f =>
    !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const currentFolder = currentFolderId ? folders[currentFolderId] : null;
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        addAsset({
          name: file.name,
          type: 'other',
          url: dataUrl,
          size: file.size,
          mimeType: file.type,
          altText: '',
        });
      };
      reader.readAsDataURL(file);
    });
    
    toast({
      title: 'Files Added',
      description: `Added ${files.length} file(s) to media`,
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      addFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolderInput(false);
      toast({ title: 'Folder Created' });
    }
  };
  
  const handleRenameFolder = (id: string) => {
    if (editingFolderName.trim()) {
      renameFolder(id, editingFolderName.trim());
      setEditingFolderId(null);
      setEditingFolderName('');
    }
  };
  
  const handleDeleteFolder = (id: string) => {
    removeFolder(id);
    toast({ title: 'Folder Deleted' });
  };
  
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: 'URL Copied' });
  };
  
  const handleDownload = (asset: MediaAsset) => {
    const a = document.createElement('a');
    a.href = asset.url;
    a.download = asset.name;
    a.click();
  };
  
  const handleDelete = (assetId: string) => {
    removeAssets([assetId]);
    setSelectedAsset(null);
    toast({ title: 'Asset Deleted' });
  };
  
  // Build breadcrumb path
  const buildBreadcrumb = (): { id: string | null; name: string }[] => {
    const path: { id: string | null; name: string }[] = [{ id: null, name: 'media' }];
    let current = currentFolderId;
    const visited = new Set<string>();
    
    while (current && !visited.has(current)) {
      visited.add(current);
      const folder = folders[current];
      if (folder) {
        path.push({ id: folder.id, name: folder.name });
        current = folder.parentId;
      } else {
        break;
      }
    }
    
    return path.reverse();
  };
  
  const breadcrumb = buildBreadcrumb();
  
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="h-10 border-b border-border flex items-center justify-between px-4 bg-muted/20">
        <div className="flex items-center gap-2 text-sm">
          <FolderOpen className="w-4 h-4 text-blue-500" />
          <span className="font-medium">Media Assets</span>
          <span className="text-muted-foreground text-xs">
            ({Object.keys(assets).length} files)
          </span>
        </div>
        <div className="flex items-center gap-1">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.zip,.rar,.7z,.ttf,.otf,.woff,.woff2"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus className="w-3 h-3" />
            Upload
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => setShowNewFolderInput(true)}
          >
            <FolderPlus className="w-3 h-3" />
            New Folder
          </Button>
        </div>
      </div>
      
      {/* Breadcrumb */}
      <div className="h-8 border-b border-border flex items-center px-4 gap-1 text-xs bg-muted/10">
        {breadcrumb.map((item, index) => (
          <React.Fragment key={item.id || 'root'}>
            {index > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
            <button
              onClick={() => setCurrentFolder(item.id)}
              className={`hover:text-primary transition-colors ${
                index === breadcrumb.length - 1 ? 'font-medium' : 'text-muted-foreground'
              }`}
            >
              {item.name}
            </button>
          </React.Fragment>
        ))}
      </div>
      
      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search media..."
            className="h-8 pl-8 text-sm"
          />
        </div>
      </div>
      
      {/* New Folder Input */}
      {showNewFolderInput && (
        <div className="px-4 py-2 border-b border-border flex items-center gap-2 bg-muted/20">
          <FolderPlus className="w-4 h-4 text-muted-foreground" />
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name..."
            className="h-7 text-sm flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder();
              if (e.key === 'Escape') setShowNewFolderInput(false);
            }}
          />
          <Button size="sm" className="h-7" onClick={handleCreateFolder}>
            <Check className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7" onClick={() => setShowNewFolderInput(false)}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
      
      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {/* Back button */}
            {currentFolderId && (
              <button
                onClick={() => setCurrentFolder(currentFolder?.parentId || null)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-muted/50 text-sm text-muted-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to {currentFolder?.parentId ? folders[currentFolder.parentId]?.name : 'root'}
              </button>
            )}
            
            {/* Folders */}
            {currentFolders.map(folder => (
              <div
                key={folder.id}
                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-muted/50 cursor-pointer group"
                onClick={() => editingFolderId !== folder.id && setCurrentFolder(folder.id)}
              >
                <Folder className="w-4 h-4 text-amber-500" />
                {editingFolderId === folder.id ? (
                  <div className="flex items-center gap-1 flex-1">
                    <Input
                      value={editingFolderName}
                      onChange={(e) => setEditingFolderName(e.target.value)}
                      className="h-6 text-sm"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Enter') handleRenameFolder(folder.id);
                        if (e.key === 'Escape') setEditingFolderId(null);
                      }}
                    />
                    <Button size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); handleRenameFolder(folder.id); }}>
                      <Check className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm flex-1">{folder.name}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingFolderId(folder.id); setEditingFolderName(folder.name); }}
                        className="p-1 rounded hover:bg-muted"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                        className="p-1 rounded hover:bg-destructive/20 text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            
            {/* Assets */}
            {filteredAssets.map(asset => {
              const Icon = typeIcons[asset.type] || File;
              return (
                <div
                  key={asset.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer group ${
                    selectedAsset?.id === asset.id ? 'bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedAsset(asset)}
                >
                  {asset.type === 'image' && asset.url ? (
                    <img src={asset.url} alt={asset.name} className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(asset.size)}</p>
                  </div>
                </div>
              );
            })}
            
            {filteredAssets.length === 0 && currentFolders.length === 0 && !currentFolderId && (
              <div className="text-center py-12 text-muted-foreground">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No media files yet</p>
                <p className="text-xs mt-1">Upload files or create folders to organize your assets</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Asset Preview Sidebar */}
        {selectedAsset && (
          <div className="w-64 border-l border-border bg-muted/10 flex flex-col">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-medium truncate">{selectedAsset.name}</h3>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setSelectedAsset(null)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-3">
                {/* Preview */}
                <div className="aspect-video bg-muted rounded overflow-hidden">
                  {selectedAsset.type === 'image' ? (
                    <img src={selectedAsset.url} alt={selectedAsset.altText} className="w-full h-full object-contain" />
                  ) : selectedAsset.type === 'video' ? (
                    <video src={selectedAsset.url} controls className="w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {React.createElement(typeIcons[selectedAsset.type] || File, { className: 'w-8 h-8 text-muted-foreground' })}
                    </div>
                  )}
                </div>
                
                {/* Info */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size</span>
                    <span>{formatFileSize(selectedAsset.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span>{selectedAsset.mimeType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Added</span>
                    <span>{new Date(selectedAsset.addedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex flex-col gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs gap-1 justify-start"
                    onClick={() => handleCopyUrl(selectedAsset.url)}
                  >
                    <Copy className="w-3 h-3" />
                    Copy URL
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs gap-1 justify-start"
                    onClick={() => handleDownload(selectedAsset)}
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs gap-1 justify-start text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDelete(selectedAsset.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};
