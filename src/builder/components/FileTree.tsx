import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, FileCode, FolderOpen, Folder, FileImage, FileVideo, Film, Palette } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  path: string;
}

interface FileTreeProps {
  onFileSelect: (path: string) => void;
  selectedFile: string;
  pages: string[];
}

export const FileTree: React.FC<FileTreeProps> = ({ onFileSelect, selectedFile, pages }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/', '/pages', '/components', '/media']));

  const fileStructure: FileNode[] = useMemo(() => {
    const structure: FileNode[] = [];
    
    // Pages folder
    if (pages.length > 0) {
      structure.push({
        name: 'pages',
        type: 'folder',
        path: '/pages',
        children: pages.map(pageName => ({
          name: `${pageName.toLowerCase().replace(/\s+/g, '-')}.html`,
          type: 'file' as const,
          path: `/pages/${pageName.toLowerCase().replace(/\s+/g, '-')}.html`,
        })),
      });
    }
    
    // Components folder (always present)
    structure.push({
      name: 'components',
      type: 'folder',
      path: '/components',
      children: [],
    });
    
    // Media folder with placeholder files
    structure.push({
      name: 'media',
      type: 'folder',
      path: '/media',
      children: [
        { name: 'images', type: 'folder' as const, path: '/media/images', children: [] },
        { name: 'videos', type: 'folder' as const, path: '/media/videos', children: [] },
        { name: 'lottie', type: 'folder' as const, path: '/media/lottie', children: [] },
      ],
    });
    
    // Global files
    structure.push({ name: 'styles.css', type: 'file', path: '/styles.css' });
    structure.push({ name: 'script.js', type: 'file', path: '/script.js' });
    
    return structure;
  }, [pages]);

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderNode = (node: FileNode, depth: number = 0): React.ReactNode => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedFile === node.path;

    if (node.type === 'folder') {
      return (
        <div key={node.path}>
          <div
            className={`flex items-center gap-1 px-2 py-1.5 cursor-pointer hover:bg-muted/50 text-xs ${
              isSelected ? 'bg-muted' : ''
            }`}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            onClick={() => toggleFolder(node.path)}
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="w-3 h-3 flex-shrink-0 text-blue-500" />
            ) : (
              <Folder className="w-3 h-3 flex-shrink-0 text-blue-500" />
            )}
            <span className="truncate">{node.name}</span>
          </div>
          {isExpanded && node.children && (
            <div>
              {node.children.map((child) => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // Get appropriate icon for file type
    const getFileIcon = () => {
      if (node.path.endsWith('.html')) return <FileCode className="w-3 h-3 flex-shrink-0 text-orange-500" />;
      if (node.path.endsWith('.css')) return <Palette className="w-3 h-3 flex-shrink-0 text-blue-500" />;
      if (node.path.endsWith('.js')) return <FileCode className="w-3 h-3 flex-shrink-0 text-yellow-500" />;
      if (node.path.includes('/images/') || node.path.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
        return <FileImage className="w-3 h-3 flex-shrink-0 text-green-500" />;
      }
      if (node.path.includes('/videos/') || node.path.match(/\.(mp4|webm|mov)$/)) {
        return <FileVideo className="w-3 h-3 flex-shrink-0 text-purple-500" />;
      }
      if (node.path.includes('/lottie/') || node.path.endsWith('.json')) {
        return <Film className="w-3 h-3 flex-shrink-0 text-pink-500" />;
      }
      return <FileCode className="w-3 h-3 flex-shrink-0 text-muted-foreground" />;
    };

    return (
      <div
        key={node.path}
        className={`flex items-center gap-1 px-2 py-1.5 cursor-pointer hover:bg-muted/50 text-xs ${
          isSelected ? 'bg-muted' : ''
        }`}
        style={{ paddingLeft: `${depth * 12 + 20}px` }}
        onClick={() => onFileSelect(node.path)}
      >
        {getFileIcon()}
        <span className="truncate">{node.name}</span>
      </div>
    );
  };

  return (
    <ScrollArea className="h-full">
      <div className="py-2">
        {fileStructure.map((node) => renderNode(node))}
      </div>
    </ScrollArea>
  );
};
