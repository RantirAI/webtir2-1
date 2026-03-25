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
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
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
  componentInstanceId?: string;
  componentPrebuiltId?: string;
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
  onAddCodeFolder?: (parentPath: string, folderName?: string) => void;
  onUploadCodeFiles?: (files: File[], targetPath: string) => void;
  onRenameCodeItem?: (oldPath: string, newName: string) => void;
  onDeleteCodeItem?: (path: string) => void;
  onMoveCodeItem?: (sourcePath: string, destinationFolderPath: string) => void;
  onRenameComponent?: (instanceId: string, prebuiltId: string | undefined, newName: string) => void;
  onRenameMediaFolder?: (folderId: string, newName: string) => void;
  onRenameMediaAsset?: (assetId: string, newName: string) => void;
  onDeleteMediaFolder?: (folderId: string) => void;
  onDeleteMediaAsset?: (assetId: string) => void;
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

type NameDialogState =
  | {
      mode: 'add-folder';
      title: string;
      description?: string;
      initialValue: string;
      parentPath: string;
    }
  | {
      mode: 'rename-code';
      title: string;
      description?: string;
      initialValue: string;
      path: string;
    }
  | {
      mode: 'rename-component';
      title: string;
      description?: string;
      initialValue: string;
      instanceId: string;
      prebuiltId?: string;
    }
  | {
      mode: 'rename-media-folder';
      title: string;
      description?: string;
      initialValue: string;
      folderId: string;
    }
  | {
      mode: 'rename-media-asset';
      title: string;
      description?: string;
      initialValue: string;
      assetId: string;
    };

type DeleteDialogState =
  | {
      mode: 'delete-code';
      title: string;
      description: string;
      path: string;
    }
  | {
      mode: 'delete-media-folder';
      title: string;
      description: string;
      folderId: string;
    }
  | {
      mode: 'delete-media-asset';
      title: string;
      description: string;
      assetId: string;
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
  onRenameCodeItem,
  onDeleteCodeItem,
  onMoveCodeItem,
  onRenameComponent,
  onRenameMediaFolder,
  onRenameMediaAsset,
  onDeleteMediaFolder,
  onDeleteMediaAsset,
}) => {
  const rootInstance = useBuilderStore((state) => state.rootInstance);
  const { assets, folders, getFoldersInParent, getAssetsInFolder } = useMediaStore();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['/', '/pages', '/components', '/files', '/assets'])
  );
  const [dropTargetPath, setDropTargetPath] = useState<string | null>(null);
  const [uploadTargetPath, setUploadTargetPath] = useState('/files');
  const [draggedCodePath, setDraggedCodePath] = useState<string | null>(null);
  const [nameDialogState, setNameDialogState] = useState<NameDialogState | null>(null);
  const [nameDialogValue, setNameDialogValue] = useState('');
  const [deleteDialogState, setDeleteDialogState] = useState<DeleteDialogState | null>(null);
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
      componentInstanceId: entry.instanceId,
      componentPrebuiltId: entry.prebuiltId,
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
      ...buildMediaFolderTree(null, '/assets'),
      ...rootAssets.map((asset) => ({
        name: asset.name,
        type: 'file' as const,
        path: `/assets/${asset.name}__${asset.id}`,
        isMedia: true,
        mediaAsset: asset,
      })),
    ];

    structure.push({
      name: 'assets',
      type: 'folder',
      path: '/assets',
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

  const openNameDialog = (state: NameDialogState) => {
    setNameDialogState(state);
    setNameDialogValue(state.initialValue);
  };

  const openDeleteDialog = (state: DeleteDialogState) => {
    setDeleteDialogState(state);
  };

  const closeNameDialog = () => {
    setNameDialogState(null);
    setNameDialogValue('');
  };

  const closeDeleteDialog = () => {
    setDeleteDialogState(null);
  };

  const submitNameDialog = () => {
    if (!nameDialogState) return;
    const trimmedName = nameDialogValue.trim();
    if (!trimmedName) return;

    switch (nameDialogState.mode) {
      case 'add-folder':
        onAddCodeFolder?.(nameDialogState.parentPath, trimmedName);
        break;
      case 'rename-code':
        onRenameCodeItem?.(nameDialogState.path, trimmedName);
        break;
      case 'rename-component':
        onRenameComponent?.(nameDialogState.instanceId, nameDialogState.prebuiltId, trimmedName);
        break;
      case 'rename-media-folder':
        onRenameMediaFolder?.(nameDialogState.folderId, trimmedName);
        break;
      case 'rename-media-asset':
        onRenameMediaAsset?.(nameDialogState.assetId, trimmedName);
        break;
    }

    closeNameDialog();
  };

  const submitDeleteDialog = () => {
    if (!deleteDialogState) return;

    switch (deleteDialogState.mode) {
      case 'delete-code':
        onDeleteCodeItem?.(deleteDialogState.path);
        break;
      case 'delete-media-folder':
        onDeleteMediaFolder?.(deleteDialogState.folderId);
        break;
      case 'delete-media-asset':
        onDeleteMediaAsset?.(deleteDialogState.assetId);
        break;
    }

    closeDeleteDialog();
  };

  const renderNode = (node: FileNode, depth: number = 0): React.ReactNode => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedFile === node.path;

    const getAddHandler = (path: string) => {
      if (path === '/pages') return onAddPage;
      if (path === '/components') return onAddComponent;
      if (path === '/assets') return onAddMedia;
      return undefined;
    };

    if (node.type === 'folder') {
      const hasChildren = node.children && node.children.length > 0;
      const addHandler = getAddHandler(node.path);
      const isMediaFolder = node.path === '/assets' || node.isMediaFolder;
      const isCodeFolder = node.path.startsWith('/files') || node.isCodeFolder;
      const isDropTarget = dropTargetPath === node.path;
      const isRootCodeFolder = node.path === '/files';
      const isDraggableCodeFolder = isCodeFolder && !isRootCodeFolder;

      const folderRow = (
        <div
          draggable={isDraggableCodeFolder}
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
          onDragStart={(e) => {
            if (!isDraggableCodeFolder) return;
            setDraggedCodePath(node.path);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('application/x-builder-code-path', node.path);
          }}
          onDragEnd={() => {
            setDraggedCodePath(null);
            setDropTargetPath(null);
          }}
          onDragOver={(e) => {
            if (!isCodeFolder) return;
            const internalPath = e.dataTransfer.getData('application/x-builder-code-path') || draggedCodePath;
            const hasInternalMove = Boolean(onMoveCodeItem && internalPath);
            const hasExternalUpload = Boolean(onUploadCodeFiles && e.dataTransfer.files && e.dataTransfer.files.length > 0);
            if (!hasInternalMove && !hasExternalUpload) return;
            e.preventDefault();
            setDropTargetPath(node.path);
          }}
          onDragLeave={() => {
            if (!isCodeFolder) return;
            setDropTargetPath((current) => (current === node.path ? null : current));
          }}
          onDrop={(e) => {
            if (!isCodeFolder) return;
            e.preventDefault();
            setDropTargetPath(null);
            const internalPath = e.dataTransfer.getData('application/x-builder-code-path') || draggedCodePath;
            if (
              internalPath &&
              onMoveCodeItem &&
              internalPath !== node.path &&
              !node.path.startsWith(`${internalPath}/`)
            ) {
              onMoveCodeItem(internalPath, node.path);
              setDraggedCodePath(null);
              return;
            }
            if (!onUploadCodeFiles) return;
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
                openNameDialog({
                  mode: 'add-folder',
                  title: 'Create folder',
                  description: `Add a new folder inside ${node.name}.`,
                  initialValue: 'new-folder',
                  parentPath: node.path,
                });
              }}
              className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-primary/20 hover:text-primary transition-opacity"
              title={`Add folder in ${node.name}`}
            >
              <FolderPlus className="w-3 h-3" />
            </button>
          )}

          {isCodeFolder && node.path !== '/files' && onRenameCodeItem && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openNameDialog({
                  mode: 'rename-code',
                  title: 'Rename folder',
                  description: `Update folder name for ${node.name}.`,
                  initialValue: node.name,
                  path: node.path,
                });
              }}
              className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-primary/20 hover:text-primary transition-opacity"
              title={`Rename ${node.name}`}
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}

          {isCodeFolder && node.path !== '/files' && onDeleteCodeItem && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openDeleteDialog({
                  mode: 'delete-code',
                  title: 'Delete folder',
                  description: `Delete "${node.name}" and all of its contents?`,
                  path: node.path,
                });
              }}
              className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-opacity"
              title={`Delete ${node.name}`}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}

          {node.isMediaFolder && node.mediaFolder && onRenameMediaFolder && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openNameDialog({
                  mode: 'rename-media-folder',
                  title: 'Rename media folder',
                  description: `Update folder name for ${node.name}.`,
                  initialValue: node.mediaFolder?.name || node.name,
                  folderId: node.mediaFolder.id,
                });
              }}
              className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-primary/20 hover:text-primary transition-opacity"
              title={`Rename ${node.name}`}
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}

          {node.isMediaFolder && node.mediaFolder && onDeleteMediaFolder && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openDeleteDialog({
                  mode: 'delete-media-folder',
                  title: 'Delete media folder',
                  description: `Delete media folder "${node.name}"?`,
                  folderId: node.mediaFolder.id,
                });
              }}
              className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-opacity"
              title={`Delete ${node.name}`}
            >
              <Trash2 className="w-3 h-3" />
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

          {(node.path === '/components' || node.path === '/assets' || node.path === '/files') && hasChildren && (
            <span className="text-[10px] text-muted-foreground">{node.children?.length}</span>
          )}
        </div>
      );

      const folderContent = (
        <div key={node.path}>
          {isCodeFolder && (onAddCodeFolder || onUploadCodeFiles || (!isRootCodeFolder && (onRenameCodeItem || onDeleteCodeItem))) ? (
            <ContextMenu>
              <ContextMenuTrigger asChild>{folderRow}</ContextMenuTrigger>
              <ContextMenuContent>
                {onAddCodeFolder && (
                  <ContextMenuItem
                    onClick={() =>
                      openNameDialog({
                        mode: 'add-folder',
                        title: 'Create folder',
                        description: `Add a new folder inside ${node.name}.`,
                        initialValue: 'new-folder',
                        parentPath: node.path,
                      })
                    }
                  >
                    <FolderPlus className="w-3.5 h-3.5 mr-2" /> New Folder
                  </ContextMenuItem>
                )}
                {onUploadCodeFiles && (
                  <ContextMenuItem onClick={() => openFileUpload(node.path, 'files')}>
                    <Upload className="w-3.5 h-3.5 mr-2" /> Upload Files
                  </ContextMenuItem>
                )}
                {(onAddCodeFolder || onUploadCodeFiles) && !isRootCodeFolder && (onRenameCodeItem || onDeleteCodeItem) && (
                  <ContextMenuSeparator />
                )}
                {!isRootCodeFolder && onRenameCodeItem && (
                  <ContextMenuItem
                    onClick={() =>
                      openNameDialog({
                        mode: 'rename-code',
                        title: 'Rename folder',
                        description: `Update folder name for ${node.name}.`,
                        initialValue: node.name,
                        path: node.path,
                      })
                    }
                  >
                    <Pencil className="w-3.5 h-3.5 mr-2" /> Rename
                  </ContextMenuItem>
                )}
                {!isRootCodeFolder && onDeleteCodeItem && (
                  <ContextMenuItem
                    className="text-destructive"
                    onClick={() =>
                      openDeleteDialog({
                        mode: 'delete-code',
                        title: 'Delete folder',
                        description: `Delete "${node.name}" and all of its contents?`,
                        path: node.path,
                      })
                    }
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                  </ContextMenuItem>
                )}
              </ContextMenuContent>
            </ContextMenu>
          ) : (
            folderRow
          )}
          {isExpanded && node.children && <div>{node.children.map((child) => renderNode(child, depth + 1))}</div>}
        </div>
      );

      return folderContent;
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

    const isCodeFile = node.isCodeFile || node.path.startsWith('/files/');

    const fileRow = (
      <div
        draggable={isCodeFile}
        className={`group flex items-center gap-1 px-2 py-1.5 cursor-pointer hover:bg-muted/50 text-xs ${
          isSelected ? 'bg-muted' : ''
        }`}
        style={{ paddingLeft: `${depth * 12 + 20}px` }}
        onClick={() => onFileSelect(node.path)}
        onDragStart={(e) => {
          if (!isCodeFile) return;
          setDraggedCodePath(node.path);
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('application/x-builder-code-path', node.path);
        }}
        onDragEnd={() => {
          setDraggedCodePath(null);
          setDropTargetPath(null);
        }}
      >
        {isComponentFile ? (
          <Component className={`w-3 h-3 flex-shrink-0 ${node.isLinked ? 'text-green-500' : 'text-purple-500'}`} />
        ) : isMediaFile && MediaIcon ? (
          <MediaIcon className="w-3 h-3 flex-shrink-0 text-amber-500" />
        ) : (
          <FileCode className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
        )}
        <span className="truncate flex-1">{node.name}</span>

        {isComponentFile && onRenameComponent && node.componentInstanceId && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              openNameDialog({
                mode: 'rename-component',
                title: 'Rename component',
                description: `Update name for ${node.name.replace(/\.html$/i, '')}.`,
                initialValue: node.name.replace(/\.html$/i, ''),
                instanceId: node.componentInstanceId,
                prebuiltId: node.componentPrebuiltId,
              });
            }}
            className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-primary/20 hover:text-primary transition-opacity"
            title={`Rename ${node.name}`}
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}

        {isMediaFile && node.mediaAsset && onRenameMediaAsset && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              openNameDialog({
                mode: 'rename-media-asset',
                title: 'Rename media',
                description: `Update name for ${node.name}.`,
                initialValue: node.mediaAsset?.name || node.name,
                assetId: node.mediaAsset.id,
              });
            }}
            className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-primary/20 hover:text-primary transition-opacity"
            title={`Rename ${node.name}`}
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}

        {isMediaFile && node.mediaAsset && onDeleteMediaAsset && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              openDeleteDialog({
                mode: 'delete-media-asset',
                title: 'Delete media',
                description: `Delete "${node.name}"?`,
                assetId: node.mediaAsset.id,
              });
            }}
            className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-opacity"
            title={`Delete ${node.name}`}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}

        {node.isLinked && (
          <span className="text-[8px] px-1 py-0.5 bg-green-500/20 text-green-500 rounded">linked</span>
        )}
      </div>
    );

    if (isCodeFile && (onRenameCodeItem || onDeleteCodeItem)) {
      return (
        <ContextMenu key={node.path}>
          <ContextMenuTrigger asChild>{fileRow}</ContextMenuTrigger>
          <ContextMenuContent>
            {onRenameCodeItem && (
              <ContextMenuItem
                onClick={() =>
                  openNameDialog({
                    mode: 'rename-code',
                    title: 'Rename file',
                    description: `Update file name for ${node.name}.`,
                    initialValue: node.name,
                    path: node.path,
                  })
                }
              >
                <Pencil className="w-3.5 h-3.5 mr-2" /> Rename
              </ContextMenuItem>
            )}
            {onDeleteCodeItem && (
              <ContextMenuItem
                className="text-destructive"
                onClick={() =>
                  openDeleteDialog({
                    mode: 'delete-code',
                    title: 'Delete file',
                    description: `Delete "${node.name}"?`,
                    path: node.path,
                  })
                }
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
              </ContextMenuItem>
            )}
          </ContextMenuContent>
        </ContextMenu>
      );
    }

    return <React.Fragment key={node.path}>{fileRow}</React.Fragment>;
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

      <Dialog
        open={Boolean(nameDialogState)}
        onOpenChange={(open) => {
          if (!open) closeNameDialog();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{nameDialogState?.title || 'Edit name'}</DialogTitle>
            {nameDialogState?.description && <DialogDescription>{nameDialogState.description}</DialogDescription>}
          </DialogHeader>
          <Input
            value={nameDialogValue}
            onChange={(e) => setNameDialogValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submitNameDialog();
              }
            }}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={closeNameDialog}>Cancel</Button>
            <Button onClick={submitNameDialog}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteDialogState)}
        onOpenChange={(open) => {
          if (!open) closeDeleteDialog();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{deleteDialogState?.title || 'Delete item'}</DialogTitle>
            <DialogDescription>{deleteDialogState?.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteDialog}>Cancel</Button>
            <Button variant="destructive" onClick={submitDeleteDialog}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ScrollArea>
  );
};