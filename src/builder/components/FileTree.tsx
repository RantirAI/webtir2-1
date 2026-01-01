import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, FileCode, FolderOpen, Folder, Component, Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBuilderStore } from '../store/useBuilderStore';
import { discoverComponents, ComponentCodeEntry } from '../utils/componentCodeExport';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  path: string;
  isComponent?: boolean;
  isLinked?: boolean;
}

interface FileTreeProps {
  onFileSelect: (path: string) => void;
  selectedFile: string;
  pages: string[];
  onAddComponent?: () => void;
  onAddPage?: () => void;
  onAddMedia?: () => void;
}

export const FileTree: React.FC<FileTreeProps> = ({ onFileSelect, selectedFile, pages, onAddComponent, onAddPage, onAddMedia }) => {
  const rootInstance = useBuilderStore((state) => state.rootInstance);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/', '/pages', '/components', '/media']));

  // Discover components from canvas
  const componentEntries = useMemo(() => {
    if (!rootInstance) return [];
    return discoverComponents(rootInstance);
  }, [rootInstance]);

  // Convert component entries to file nodes
  const componentNodesToFileNodes = (entries: ComponentCodeEntry[]): FileNode[] => {
    return entries.map(entry => ({
      name: `${entry.name}.html`,
      type: 'file' as const,
      path: entry.path,
      isComponent: true,
      isLinked: entry.isLinked,
      children: entry.children.length > 0 
        ? componentNodesToFileNodes(entry.children) 
        : undefined,
    }));
  };

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
    
    // Components folder - now populated with actual canvas components
    const componentNodes = componentNodesToFileNodes(componentEntries);
    structure.push({
      name: 'components',
      type: 'folder',
      path: '/components',
      children: componentNodes,
    });
    
    // Media folder
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
  }, [pages, componentEntries]);

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

    // Determine which add handler to use based on folder path
    const getAddHandler = (path: string) => {
      if (path === '/pages') return onAddPage;
      if (path === '/components') return onAddComponent;
      if (path === '/media') return onAddMedia;
      return undefined;
    };

    if (node.type === 'folder') {
      const hasChildren = node.children && node.children.length > 0;
      const addHandler = getAddHandler(node.path);
      
      return (
        <div key={node.path}>
          <div
            className={`group flex items-center gap-1 px-2 py-1.5 cursor-pointer hover:bg-muted/50 text-xs ${
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
            <span className="truncate flex-1">{node.name}</span>
            
            {/* Add button for specific folders */}
            {addHandler && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addHandler();
                }}
                className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-primary/20 hover:text-primary transition-opacity"
                title={`Add to ${node.name}`}
              >
                <Plus className="w-3 h-3" />
              </button>
            )}
            
            {node.path === '/components' && hasChildren && (
              <span className="text-[10px] text-muted-foreground">
                {node.children?.length}
              </span>
            )}
          </div>
          {isExpanded && node.children && (
            <div>
              {node.children.map((child) => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // File node
    const isComponentFile = node.isComponent;
    
    return (
      <div
        key={node.path}
        className={`flex items-center gap-1 px-2 py-1.5 cursor-pointer hover:bg-muted/50 text-xs ${
          isSelected ? 'bg-muted' : ''
        }`}
        style={{ paddingLeft: `${depth * 12 + 20}px` }}
        onClick={() => onFileSelect(node.path)}
      >
        {isComponentFile ? (
          <Component className={`w-3 h-3 flex-shrink-0 ${node.isLinked ? 'text-green-500' : 'text-purple-500'}`} />
        ) : (
          <FileCode className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
        )}
        <span className="truncate">{node.name}</span>
        {node.isLinked && (
          <span className="ml-auto text-[8px] px-1 py-0.5 bg-green-500/20 text-green-500 rounded">
            linked
          </span>
        )}
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
