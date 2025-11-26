import React, { useState } from 'react';
import { ChevronRight, ChevronDown, FileCode, FolderOpen, Folder, FileImage, Palette, MessageSquare } from 'lucide-react';
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
}

export const FileTree: React.FC<FileTreeProps> = ({ onFileSelect, selectedFile }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/', '/pages', '/components']));

  const fileStructure: FileNode[] = [
    {
      name: 'pages',
      type: 'folder',
      path: '/pages',
      children: [
        { name: 'index.html', type: 'file', path: '/pages/index.html' },
        { name: 'about.html', type: 'file', path: '/pages/about.html' },
      ],
    },
    {
      name: 'components',
      type: 'folder',
      path: '/components',
      children: [
        { name: 'Header.jsx', type: 'file', path: '/components/Header.jsx' },
        { name: 'Footer.jsx', type: 'file', path: '/components/Footer.jsx' },
      ],
    },
    {
      name: 'styles',
      type: 'folder',
      path: '/styles',
      children: [
        { name: 'main.css', type: 'file', path: '/styles/main.css' },
        { name: 'variables.css', type: 'file', path: '/styles/variables.css' },
      ],
    },
  ];

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

    return (
      <div
        key={node.path}
        className={`flex items-center gap-1 px-2 py-1.5 cursor-pointer hover:bg-muted/50 text-xs ${
          isSelected ? 'bg-muted' : ''
        }`}
        style={{ paddingLeft: `${depth * 12 + 20}px` }}
        onClick={() => onFileSelect(node.path)}
      >
        <FileCode className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
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
