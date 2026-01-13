import React, { useRef, useState } from 'react';
import { 
  useMediaStore, 
  MediaAsset, 
  FilterType, 
  SortField, 
  formatFileSize 
} from '../store/useMediaStore';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import {
  Search,
  Plus,
  Trash2,
  Download,
  Image as ImageIcon,
  Video,
  FileText,
  Music,
  Archive,
  Code,
  File,
  ChevronDown,
  Check,
  Sparkles,
  Shrink,
  Link,
  Filter,
  ArrowUpDown,
  Type,
  FileSpreadsheet,
  FileArchive,
  Folder,
  FolderOpen,
  FolderPlus,
  ChevronLeft,
  Pencil,
  X,
} from 'lucide-react';

const typeIcons: Record<string, React.ElementType> = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  document: FileText,
  archive: FileArchive,
  font: Type,
  code: Code,
  other: File,
};

// Document-specific icons based on file extension
const getDocumentIcon = (name: string): React.ElementType => {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return FileText;
  if (ext === 'zip' || ext === 'rar' || ext === '7z') return FileArchive;
  if (ext === 'xlsx' || ext === 'xls') return FileSpreadsheet;
  if (ext === 'docx' || ext === 'doc') return FileText;
  return FileText;
};

const filterLabels: Record<FilterType, string> = {
  all: 'All',
  image: 'Images',
  video: 'Videos',
  audio: 'Audio',
  document: 'Documents',
  archive: 'Archives',
  font: 'Fonts',
  code: 'Code',
  other: 'Other',
};

const sortLabels: Record<SortField, string> = {
  name: 'Alphabetical',
  addedAt: 'Date Created',
  size: 'File Size',
};

interface MediaItemProps {
  asset: MediaAsset;
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
}

const MediaItem: React.FC<MediaItemProps> = ({ asset, isSelected, onSelect, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `media-${asset.id}`,
    data: { 
      type: 'MediaAsset',
      asset: asset,
      isMediaAsset: true,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };
  
  const renderPreview = () => {
    const isImage = asset.type === 'image' || asset.mimeType?.startsWith('image/');
    const isVideo = asset.type === 'video' || asset.mimeType?.startsWith('video/');

    if (isImage && asset.url) {
      return (
        <img 
          src={asset.url} 
          alt={asset.altText || asset.name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to icon if image fails to load
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement?.classList.add('fallback-icon');
          }}
        />
      );
    }
    if (isVideo && asset.url) {
      return (
        <video 
          src={asset.url} 
          className="w-full h-full object-cover"
          muted
          playsInline
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }
    
    // Get specific icon for document types
    let Icon = typeIcons[asset.type] || File;
    if (asset.type === 'document' || asset.type === 'archive') {
      Icon = getDocumentIcon(asset.name);
    }
    
    // Color coding for different file types
    const iconColors: Record<string, string> = {
      document: 'text-red-500',
      archive: 'text-amber-500',
      audio: 'text-purple-500',
      font: 'text-blue-500',
      code: 'text-green-500',
      other: 'text-muted-foreground',
    };
    
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <Icon className={`w-6 h-6 ${iconColors[asset.type] || 'text-muted-foreground'}`} />
      </div>
    );
  };
  
  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative group rounded-md border overflow-hidden cursor-grab active:cursor-grabbing transition-all ${
        isSelected ? 'ring-2 ring-primary border-primary' : 'border-border hover:border-primary/50'
      }`}
      onClick={onClick}
    >
      {/* Selection Checkbox */}
      <div 
        className="absolute top-1 left-1 z-10"
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <Checkbox 
          checked={isSelected}
          className="bg-background/80 backdrop-blur-sm"
        />
      </div>
      
      {/* Preview */}
      <div className="aspect-square bg-muted overflow-hidden">
        {renderPreview()}
      </div>
      
      {/* Label */}
      <div className="p-1 bg-background">
        <p className="text-[9px] truncate text-foreground">{asset.name}</p>
        <p className="text-[8px] text-muted-foreground">{formatFileSize(asset.size)}</p>
      </div>
      
      {/* Compressed badge */}
      {asset.compressed && (
        <div className="absolute top-1 right-1 bg-green-500 text-white text-[8px] px-1 rounded">
          Opt
        </div>
      )}
    </div>
  );
};

export const MediaPanel: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    assets,
    folders,
    selectedIds,
    currentFolderId,
    searchQuery,
    filterType,
    sortField,
    sortOrder,
    autoCompress,
    addAsset,
    addFolder,
    removeFolder,
    renameFolder,
    removeAssets,
    updateAsset,
    getFilteredAssets,
    getFoldersInParent,
    setCurrentFolder,
    toggleAssetSelection,
    selectAll,
    clearSelection,
    setSearchQuery,
    setFilterType,
    setSortField,
    setSortOrder,
    setAutoCompress,
  } = useMediaStore();
  
  const [detailAsset, setDetailAsset] = useState<MediaAsset | null>(null);
  const [altTextInput, setAltTextInput] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  
  const filteredAssets = getFilteredAssets();
  const currentFolders = getFoldersInParent(currentFolderId);
  const currentFolder = currentFolderId ? folders[currentFolderId] : null;
  
  const assetCounts = Object.values(assets).reduce((acc, asset) => {
    acc[asset.type] = (acc[asset.type] || 0) + 1;
    acc.all = (acc.all || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        addAsset({
          name: file.name,
          type: 'other', // Will be auto-detected by store
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
      description: `Added ${files.length} file(s) to assets`,
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleDelete = () => {
    if (selectedIds.length === 0) return;
    removeAssets(selectedIds);
    toast({
      title: 'Deleted',
      description: `Removed ${selectedIds.length} file(s)`,
    });
  };
  
  const handleCompress = () => {
    if (selectedIds.length === 0) return;
    toast({
      title: 'Compression Started',
      description: `Compressing ${selectedIds.length} file(s) to WebP/AVIF...`,
    });
    // Mark as compressed (simulated)
    selectedIds.forEach(id => {
      updateAsset(id, { compressed: true });
    });
  };
  
  const handleGenerateAltText = () => {
    if (selectedIds.length === 0) return;
    toast({
      title: 'AI Alt Text',
      description: `Generating alt text for ${selectedIds.length} file(s)...`,
    });
    // Simulated alt text generation
    selectedIds.forEach(id => {
      const asset = assets[id];
      if (asset && (asset.type === 'image' || asset.type === 'video')) {
        updateAsset(id, { altText: `AI generated description for ${asset.name}` });
      }
    });
  };
  
  const handleCopyLink = (asset: MediaAsset) => {
    navigator.clipboard.writeText(asset.url);
    toast({
      title: 'Link Copied',
      description: 'Download link copied to clipboard',
    });
  };
  
  const openDetail = (asset: MediaAsset) => {
    setDetailAsset(asset);
    setAltTextInput(asset.altText || '');
  };
  
  const saveAltText = () => {
    if (detailAsset) {
      updateAsset(detailAsset.id, { altText: altTextInput });
      setDetailAsset(null);
      toast({ title: 'Alt Text Saved' });
    }
  };
  
  const handleCreateFolder = () => {
    const name = newFolderName.trim();
    if (!name) return;

    // close immediately so the input never “sticks” visually
    setShowNewFolderInput(false);
    setNewFolderName('');

    addFolder(name);
    toast({ title: 'Folder Created', description: name });
  };
  
  const handleRenameFolder = (id: string) => {
    if (editingFolderName.trim()) {
      renameFolder(id, editingFolderName.trim());
      setEditingFolderId(null);
      setEditingFolderName('');
    }
  };
  
  const handleDeleteFolder = (id: string, name: string) => {
    removeFolder(id);
    toast({ title: 'Folder Deleted', description: name });
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header Actions */}
      <div className="p-2 border-b space-y-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="h-7 pl-7 text-xs"
          />
        </div>
        
        {/* Filters Row */}
        <div className="flex items-center gap-1">
          {/* Type Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1 flex-1">
                <Filter className="w-3 h-3" />
                {filterLabels[filterType]} ({assetCounts[filterType] || 0})
                <ChevronDown className="w-2.5 h-2.5 ml-auto" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-36 z-[9999]">
              {(Object.keys(filterLabels) as FilterType[]).map(type => (
                <DropdownMenuItem 
                  key={type} 
                  onClick={() => setFilterType(type)}
                  className="text-[11px] gap-2"
                >
                  {filterType === type && <Check className="w-3 h-3" />}
                  <span className={filterType !== type ? 'ml-5' : ''}>{filterLabels[type]}</span>
                  <span className="ml-auto text-muted-foreground">({assetCounts[type] || 0})</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1">
                <ArrowUpDown className="w-3 h-3" />
                <ChevronDown className="w-2.5 h-2.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 z-[9999]">
              <DropdownMenuLabel className="text-[10px]">Sort</DropdownMenuLabel>
              {(Object.keys(sortLabels) as SortField[]).map(field => (
                <DropdownMenuItem 
                  key={field} 
                  onClick={() => setSortField(field)}
                  className="text-[11px] gap-2"
                >
                  {sortField === field && <Check className="w-3 h-3" />}
                  <span className={sortField !== field ? 'ml-5' : ''}>{sortLabels[field]}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[10px]">Order</DropdownMenuLabel>
              <DropdownMenuItem 
                onClick={() => setSortOrder('desc')}
                className="text-[11px] gap-2"
              >
                {sortOrder === 'desc' && <Check className="w-3 h-3" />}
                <span className={sortOrder !== 'desc' ? 'ml-5' : ''}>Newest First</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSortOrder('asc')}
                className="text-[11px] gap-2"
              >
                {sortOrder === 'asc' && <Check className="w-3 h-3" />}
                <span className={sortOrder !== 'asc' ? 'ml-5' : ''}>Oldest First</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Bulk Actions */}
        <div className="flex items-center gap-1">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.zip,.rar,.7z,.ttf,.otf,.woff,.woff2,.js,.ts,.json,.html,.css,.xml"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button 
            variant="outline" 
            size="sm" 
            className="h-6 text-[10px] gap-1"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus className="w-3 h-3" />
            Files
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-6 text-[10px] gap-1"
            onClick={() => setShowNewFolderInput(true)}
          >
            <FolderPlus className="w-3 h-3" />
            Folder
          </Button>
          
          {selectedIds.length > 0 && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={handleCompress}
                title="Compress to WebP/AVIF"
              >
                <Shrink className="w-3 h-3" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={handleGenerateAltText}
                title="Generate Alt Text with AI"
              >
                <Sparkles className="w-3 h-3" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 w-6 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={handleDelete}
                title="Delete Selected"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
        
        {/* Selection Info & Auto Compress */}
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 ? (
              <>
                <span className="text-muted-foreground">{selectedIds.length} selected</span>
                <button onClick={clearSelection} className="text-primary hover:underline">Clear</button>
              </>
            ) : (
              <button onClick={selectAll} className="text-muted-foreground hover:text-primary">Select All</button>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Auto compress</span>
            <Switch
              checked={autoCompress}
              onCheckedChange={setAutoCompress}
              className="scale-75"
            />
          </div>
        </div>

        {/* Folder navigation (moved here) */}
        {currentFolderId && (
          <div className="pt-1 flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1 min-w-0">
              <button
                onClick={() => setCurrentFolder(null)}
                className="text-muted-foreground hover:text-foreground hover:underline"
              >
                All files
              </button>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium truncate">{currentFolder?.name}</span>
            </div>
            <button
              onClick={() => setCurrentFolder(currentFolder?.parentId || null)}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
              title="Up one folder"
            >
              <ChevronLeft className="w-3 h-3" />
              Up
            </button>
          </div>
        )}
      </div>

      {/* New Folder Input */}
      {showNewFolderInput && (
        <div className="px-2 py-1.5 border-b flex items-center gap-1">
          <FolderPlus className="w-3 h-3 text-muted-foreground" />
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name..."
            className="h-6 text-xs flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder();
              if (e.key === 'Escape') setShowNewFolderInput(false);
            }}
          />
          <Button size="sm" className="h-6 w-6 p-0" onClick={handleCreateFolder}>
            <Check className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowNewFolderInput(false)}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
      
      {/* Assets Grid */}
      <ScrollArea className="flex-1 [&_[data-radix-scroll-area-scrollbar]]:opacity-0 [&:hover_[data-radix-scroll-area-scrollbar]]:opacity-100 [&_[data-radix-scroll-area-scrollbar]]:transition-opacity">
        <div className="p-2 grid grid-cols-3 gap-2">
          {/* Folders */}
          {currentFolders.map(folder => (
            <div
              key={folder.id}
              className="relative group rounded-md border border-border overflow-hidden cursor-pointer hover:border-primary/50 transition-all"
              onClick={() => editingFolderId !== folder.id && setCurrentFolder(folder.id)}
            >
              <div className="aspect-square bg-muted flex items-center justify-center">
                <FolderOpen className="w-8 h-8 text-amber-500" />
              </div>
              <div className="p-1 bg-background">
                {editingFolderId === folder.id ? (
                  <div className="flex items-center gap-0.5">
                    <Input
                      value={editingFolderName}
                      onChange={(e) => setEditingFolderName(e.target.value)}
                      className="h-5 text-[9px] px-1"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Enter') handleRenameFolder(folder.id);
                        if (e.key === 'Escape') setEditingFolderId(null);
                      }}
                    />
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRenameFolder(folder.id); }}
                      className="p-0.5"
                    >
                      <Check className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ) : (
                  <p className="text-[9px] truncate text-foreground">{folder.name}</p>
                )}
              </div>
              {/* Folder actions */}
              <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingFolderId(folder.id);
                    setEditingFolderName(folder.name);
                  }}
                  className="p-1 rounded bg-background/80 hover:bg-background"
                >
                  <Pencil className="w-2.5 h-2.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFolder(folder.id, folder.name);
                  }}
                  className="p-1 rounded bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          ))}
          
          {/* Assets */}
          {filteredAssets.map(asset => (
            <MediaItem
              key={asset.id}
              asset={asset}
              isSelected={selectedIds.includes(asset.id)}
              onSelect={() => toggleAssetSelection(asset.id)}
              onClick={() => openDetail(asset)}
            />
          ))}
          
          {filteredAssets.length === 0 && currentFolders.length === 0 && (
            <div className="col-span-3 text-center py-8 text-muted-foreground">
              <File className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No assets found</p>
              <p className="text-[10px] mt-1">Click "Files" to upload or "Folder" to organize</p>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Asset Detail Dialog */}
      <Dialog open={!!detailAsset} onOpenChange={(open) => !open && setDetailAsset(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm truncate">{detailAsset?.name}</DialogTitle>
          </DialogHeader>
          
          {detailAsset && (
            <div className="space-y-3">
              {/* Preview */}
              <div className="aspect-video bg-muted rounded overflow-hidden">
                {detailAsset.type === 'image' ? (
                  <img src={detailAsset.url} alt={detailAsset.altText} className="w-full h-full object-contain" />
                ) : detailAsset.type === 'video' ? (
                  <video src={detailAsset.url} controls className="w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {React.createElement(typeIcons[detailAsset.type] || File, { className: 'w-12 h-12 text-muted-foreground' })}
                  </div>
                )}
              </div>
              
              {/* Info */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Size:</span> {formatFileSize(detailAsset.size)}
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span> {detailAsset.mimeType}
                </div>
                <div>
                  <span className="text-muted-foreground">Added:</span> {new Date(detailAsset.addedAt).toLocaleDateString()}
                </div>
                {detailAsset.compressed && (
                  <div className="text-green-600">Compressed</div>
                )}
              </div>
              
              {/* Alt Text */}
              {(detailAsset.type === 'image' || detailAsset.type === 'video') && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Alt Text</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 text-[10px] gap-1"
                      onClick={() => {
                        setAltTextInput(`AI generated description for ${detailAsset.name}`);
                        toast({ title: 'Alt Text Generated' });
                      }}
                    >
                      <Sparkles className="w-3 h-3" />
                      Generate
                    </Button>
                  </div>
                  <Textarea
                    value={altTextInput}
                    onChange={(e) => setAltTextInput(e.target.value)}
                    placeholder="Describe this media for accessibility..."
                    className="min-h-[80px] text-xs resize-none"
                  />
                </div>
              )}
              
              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs gap-1"
                  onClick={() => handleCopyLink(detailAsset)}
                >
                  <Link className="w-3 h-3" />
                  Copy Link
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs gap-1"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = detailAsset.url;
                    a.download = detailAsset.name;
                    a.click();
                  }}
                >
                  <Download className="w-3 h-3" />
                  Download
                </Button>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex-row gap-2 sm:justify-between">
            <Button 
              variant="destructive" 
              size="sm" 
              className="gap-1"
              onClick={() => {
                if (detailAsset) {
                  removeAssets([detailAsset.id]);
                  setDetailAsset(null);
                  toast({ 
                    title: 'Asset Deleted', 
                    description: `Removed ${detailAsset.name}` 
                  });
                }
              }}
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setDetailAsset(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={saveAltText}>
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};