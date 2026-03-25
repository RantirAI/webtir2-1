import React, { useMemo, useRef, useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  FileCode,
  FolderOpen,
  Folder,
  Component,
  Plus,
  Image,
  Video,
  Music,
  File,
  Upload,
  FolderPlus,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBuilderStore } from '../store/useBuilderStore';
import { discoverComponents, ComponentCodeEntry } from '../utils/componentCodeExport';
import { useMediaStore, MediaAsset, MediaFolder } from '../store/useMediaStore';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  path: string;
  isComponent?: boolean;
  isLinked?: boolean;
  isMedia?: boolean;
  isMediaFolder?: boolean;
  isCodeFile?: boolean;
  isCodeFolder?: boolean;
  mediaAsset?: MediaAsset;
  mediaFolder?: MediaFolder;
}

interface FileTreeProps {
  onFileSelect: (path: string) => void;
  selectedFile: string;
  pages: string[];
  onAddComponent?: () => void;
  onAddPage?: () => void;
  onAddMedia?: () => void;
  codeFilePaths?: string[];
  codeFolderPaths?: string[];
  onAddCodeFolder?: (parentPath: string) => void;
  onUploadCodeFiles?: (files: File[], targetPath: string) => void;
}

const normalizePath = (path: string) => {
  if (!path.startsWith('/')) return `/${path}`;
  return path.replace(/\/+/g, '/');
};

const getParentPath = (path: string) => {
  const normalized = normalizePath(path);
  const parts = normalized.split('/').filter(Boolean);
  if (parts.length <= 1) return '/';
  return '/' + parts.slice(0, -1).join('/');
};

const getPathName = (path: string) => {
  const normalized = normalizePath(path);
  const parts = normalized.split('/').filter(Boolean);
  return parts[parts.length - 1] || normalized;
};

const buildCodeFilesTree = (codeFolderPaths: string[], codeFilePaths: string[]): FileNode => {
  const root: FileNode = {
    name: 'files',
    type: 'folder',
    path: '/files',
    isCodeFolder: true,
    children: [],
  };

  const folderNodeMap = new Map<string, FileNode>([['/files', root]]);

  const ensureFolderNode = (folderPath: string): FileNode => {
    const normalizedFolderPath = normalizePath(folderPath);
    const existing = folderNodeMap.get(normalizedFolderPath);
    if (existing) return existing;

    const parentPath = getParentPath(normalizedFolderPath);
    const parentNode = ensureFolderNode(parentPath === '/' ? '/files' : parentPath);
    const folderNode: FileNode = {
      name: getPathName(normalizedFolderPath),
      type: 'folder',
      path: normalizedFolderPath,
      isCodeFolder: true,
      children: [],
    };
    parentNode.children = parentNode.children || [];
    parentNode.children.push(folderNode);
    folderNodeMap.set(normalizedFolderPath, folderNode);
    return folderNode;
  };

  const normalizedFolders = Array.from(
    new Set(['/files', ...codeFolderPaths.map(normalizePath).filter((path) => path.startsWith('/files'))])
  ).sort((a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b));

  normalizedFolders.forEach((folderPath) => {
    if (folderPath !== '/files') ensureFolderNode(folderPath);
  });

  const normalizedFiles = Array.from(new Set(codeFilePaths.map(normalizePath))).filter((path) =>
    path.startsWith('/files/')
  );

  normalizedFiles.forEach((filePath) => {
    const parentPath = getParentPath(filePath);
    const parentNode = ensureFolderNode(parentPath);
    parentNode.children = parentNode.children || [];
    parentNode.children.push({
      name: getPathName(filePath),
      type: 'file',
      path: filePath,
      isCodeFile: true,
    });
  });

  const sortChildren = (node: FileNode) => {
    if (!node.children?.length) return;
    node.children.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    node.children.forEach(sortChildren);
  };
  sortChildren(root);

  return root;
};

export const FileTree: React.FC<FileTreeProps> = ({
  onFileSelect,
  selectedFile,
  pages,
  onAddComponent,
  onAddPage,
  onAddMedia,
  codeFilePaths = [],
  codeFolderPaths = ['/files'],
  onAddCodeFolder,
  onUploadCodeFiles,
}) => {
  const rootInstance = useBuilderStore((state) => state.rootInstance);
  const { assets, folders, getFoldersInParent, getAssetsInFolder } = useMediaStore();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['/', '/pages', '/components', '/files', '/media'])
  );
  const [dropTargetPath, setDropTargetPath] = useState<string | null>(null);
  const [uploadTargetPath, setUploadTargetPath] = useState('/files');
  const fileUploadRef = useRef<HTMLInputElement>(null);
  const folderUploadRef = useRef<HTMLInputElement>(null);

  // Discover components from canvas
  const componentEntries = useMemo(() => {
    if (!rootInstance) return [];
    return discoverComponents(rootInstance);
  }, [rootInstance]);

  // Convert component entries to file nodes
  const componentNodesToFileNodes = (entries: ComponentCodeEntry[]): FileNode[] => {
    return entries.map((entry) => ({
      name: `${entry.name}.html`,
      type: 'file' as const,
      path: entry.path,
      isComponent: true,
      isLinked: entry.isLinked,
      children: entry.children.length > 0 ? componentNodesToFileNodes(entry.children) : undefined,
    }));
  };

  // Build media folder tree recursively
  const buildMediaFolderTree = (parentId: string | null, basePath: string): FileNode[] => {
    const nodes: FileNode[] = [];

    const childFolders = getFoldersInParent(parentId);
    childFolders.forEach((folder) => {
      const folderPath = `${basePath}/${folder.name}__${folder.id}`;
      nodes.push({
        name: folder.name,
        type: 'folder',
        path: folderPath,
        isMediaFolder: true,
        mediaFolder: folder,
        children: [
          ...buildMediaFolderTree(folder.id, folderPath),
          ...getAssetsInFolder(folder.id).map((asset) => ({
            name: asset.name,
            type: 'file' as const,
            path: `${folderPath}/${asset.name}__${asset.id}`,
            isMedia: true,
            mediaAsset: asset,
          })),
        ],
      });
    });

    return nodes;
  };

  const rootAssets = getAssetsInFolder(null);

  const fileStructure: FileNode[] = useMemo(() => {
    const structure: FileNode[] = [];

    if (pages.length > 0) {
      structure.push({
        name: 'pages',
        type: 'folder',
        path: '/pages',
        children: pages.map((pageName) => ({
          name: `${pageName.toLowerCase().replace(/\s+/g, '-')}.html`,
          type: 'file' as const,
          path: `/pages/${pageName.toLowerCase().replace(/\s+/g, '-')}.html`,
        })),
      });
    }

    const componentNodes = componentNodesToFileNodes(componentEntries);
    structure.push({
      name: 'components',
      type: 'folder',
      path: '/components',
      children: componentNodes,
    });

    const codeFilesRoot = buildCodeFilesTree(codeFolderPaths, codeFilePaths);
    structure.push(codeFilesRoot);

    const mediaChildren: FileNode[] = [
      ...buildMediaFolderTree(null, '/media'),
      ...rootAssets.map((asset) => ({
        name: asset.name,
        type: 'file' as const,
        path: `/media/${asset.name}__${asset.id}`,
        isMedia: true,
        mediaAsset: asset,
      })),
    ];

    structure.push({
      name: 'media',
      type: 'folder',
      path: '/media',
      children: mediaChildren,
    });

    return structure;
  }, [pages, componentEntries, folders, assets, codeFolderPaths, codeFilePaths]);

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const openFileUpload = (targetPath: string, mode: 'files' | 'folder') => {
    setUploadTargetPath(targetPath);
    if (mode === 'folder') {
      folderUploadRef.current?.click();
      return;
    }
    fileUploadRef.current?.click();
  };

  const handleUploadSelection = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || !onUploadCodeFiles) return;
    onUploadCodeFiles(Array.from(fileList), uploadTargetPath);
  };

  const renderNode = (node: FileNode, depth: number = 0): React.ReactNode => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedFile === node.path;

    const getAddHandler = (path: string) => {
      if (path === '/pages') return onAddPage;
      if (path === '/components') return onAddComponent;
      if (path === '/media') return onAddMedia;
      return undefined;
    };

    if (node.type === 'folder') {
      const hasChildren = node.children && node.children.length > 0;
      const addHandler = getAddHandler(node.path);
      const isMediaFolder = node.path === '/media' || node.isMediaFolder;
      const isCodeFolder = node.path.startsWith('/files') || node.isCodeFolder;
      const isDropTarget = dropTargetPath === node.path;

      return (
        <div key={node.path}>
          <div
            className={`group flex items-center gap-1 px-2 py-1.5 cursor-pointer hover:bg-muted/50 text-xs ${
              isSelected ? 'bg-muted' : ''
            } ${isDropTarget ? 'bg-muted/70' : ''}`}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            onClick={() => {
              toggleFolder(node.path);
              if (isMediaFolder || isCodeFolder) {
                onFileSelect(node.path);
              }
            }}
            onDragOver={(e) => {
              if (!isCodeFolder || !onUploadCodeFiles) return;
              e.preventDefault();
              setDropTargetPath(node.path);
            }}
            onDragLeave={() => {
              if (!isCodeFolder || !onUploadCodeFiles) return;
              setDropTargetPath((current) => (current === node.path ? null : current));
            }}
            onDrop={(e) => {
              if (!isCodeFolder || !onUploadCodeFiles) return;
              e.preventDefault();
              setDropTargetPath(null);
              const files = Array.from(e.dataTransfer.files || []);
              if (files.length > 0) {
                onUploadCodeFiles(files, node.path);
              }
            }}
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

            {isCodeFolder && onUploadCodeFiles && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openFileUpload(node.path, 'files');
                  }}
                  className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-primary/20 hover:text-primary transition-opacity"
                  title={`Upload files into ${node.name}`}
                >
                  <Upload className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openFileUpload(node.path, 'folder');
                  }}
                  className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-primary/20 hover:text-primary transition-opacity"
                  title={`Upload folder into ${node.name}`}
                >
                  <FolderOpen className="w-3 h-3" />
                </button>
              </>
            )}

            {isCodeFolder && onAddCodeFolder && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddCodeFolder(node.path);
                }}
                className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-primary/20 hover:text-primary transition-opacity"
                title={`Add folder in ${node.name}`}
              >
                <FolderPlus className="w-3 h-3" />
              </button>
            )}

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

            {(node.path === '/components' || node.path === '/media' || node.path === '/files') && hasChildren && (
              <span className="text-[10px] text-muted-foreground">{node.children?.length}</span>
            )}
          </div>
          {isExpanded && node.children && <div>{node.children.map((child) => renderNode(child, depth + 1))}</div>}
        </div>
      );
    }

    const isComponentFile = node.isComponent;
    const isMediaFile = node.isMedia;

    const getMediaIcon = (asset?: MediaAsset) => {
      if (!asset) return File;
      switch (asset.type) {
        case 'image':
          return Image;
        case 'video':
          return Video;
        case 'audio':
          return Music;
        default:
          return File;
      }
    };

    const MediaIcon = isMediaFile ? getMediaIcon(node.mediaAsset) : null;

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
        ) : isMediaFile && MediaIcon ? (
          <MediaIcon className="w-3 h-3 flex-shrink-0 text-amber-500" />
        ) : (
          <FileCode className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
        )}
        <span className="truncate">{node.name}</span>
        {node.isLinked && (
          <span className="ml-auto text-[8px] px-1 py-0.5 bg-green-500/20 text-green-500 rounded">linked</span>
        )}
      </div>
    );
  };

  return (
    <ScrollArea className="h-full">
      <input
        ref={fileUploadRef}
        type="file"
        multiple
        accept=".html,.htm,.css,.js,.mjs"
        className="hidden"
        onChange={(e) => {
          handleUploadSelection(e.target.files);
          e.currentTarget.value = '';
        }}
      />
      <input
        ref={folderUploadRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          handleUploadSelection(e.target.files);
          e.currentTarget.value = '';
        }}
        {...({ webkitdirectory: 'true', directory: 'true' } as Record<string, string>)}
      />
      <div className="py-2">{fileStructure.map((node) => renderNode(node))}</div>
    </ScrollArea>
  );
};