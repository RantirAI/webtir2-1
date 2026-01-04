import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'font' | 'code' | 'other';

export interface MediaFolder {
  id: string;
  name: string;
  parentId: string | null; // null means root level
  createdAt: number;
}

export interface MediaAsset {
  id: string;
  name: string;
  type: MediaType;
  url: string;
  size: number;
  mimeType: string;
  altText: string;
  addedAt: number;
  folderId: string | null; // null means root level
  width?: number;
  height?: number;
  duration?: number;
  compressed?: boolean;
}

export type SortField = 'name' | 'addedAt' | 'size';
export type SortOrder = 'asc' | 'desc';
export type FilterType = 'all' | MediaType;

interface MediaStore {
  assets: Record<string, MediaAsset>;
  folders: Record<string, MediaFolder>;
  selectedIds: string[];
  currentFolderId: string | null; // null means root
  searchQuery: string;
  filterType: FilterType;
  sortField: SortField;
  sortOrder: SortOrder;
  autoCompress: boolean;
  
  // Asset Actions
  addAsset: (asset: Omit<MediaAsset, 'id' | 'addedAt' | 'folderId'> & { folderId?: string | null }) => string;
  addAssets: (assets: (Omit<MediaAsset, 'id' | 'addedAt' | 'folderId'> & { folderId?: string | null })[]) => string[];
  removeAsset: (id: string) => void;
  removeAssets: (ids: string[]) => void;
  updateAsset: (id: string, updates: Partial<MediaAsset>) => void;
  getAsset: (id: string) => MediaAsset | null;
  getAllAssets: () => MediaAsset[];
  getFilteredAssets: () => MediaAsset[];
  getAssetsInFolder: (folderId: string | null) => MediaAsset[];
  
  // Folder Actions
  addFolder: (name: string, parentId?: string | null) => string;
  removeFolder: (id: string) => void;
  renameFolder: (id: string, name: string) => void;
  getFoldersInParent: (parentId: string | null) => MediaFolder[];
  setCurrentFolder: (folderId: string | null) => void;
  
  // Selection
  selectAsset: (id: string) => void;
  deselectAsset: (id: string) => void;
  toggleAssetSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  
  // Filters & Sorting
  setSearchQuery: (query: string) => void;
  setFilterType: (type: FilterType) => void;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  setAutoCompress: (value: boolean) => void;
}

const getMediaType = (mimeType: string): MediaType => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('font/') || mimeType.includes('font')) return 'font';
  if (mimeType === 'application/pdf' || mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('spreadsheet')) return 'document';
  if (mimeType === 'application/zip' || mimeType.includes('archive') || mimeType.includes('compressed') || mimeType.includes('rar') || mimeType.includes('7z')) return 'archive';
  if (mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('html') || mimeType.includes('css') || mimeType.includes('xml') || mimeType.includes('text/')) return 'code';
  return 'other';
};

export const useMediaStore = create<MediaStore>()(
  persist(
    (set, get) => ({
      assets: {},
      folders: {},
      selectedIds: [],
      currentFolderId: null,
      searchQuery: '',
      filterType: 'all',
      sortField: 'addedAt',
      sortOrder: 'desc',
      autoCompress: true,
      
      addAsset: (asset) => {
        const id = `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const state = get();
        const detectedType = getMediaType(asset.mimeType);
        const finalType: MediaType = asset.type && asset.type !== 'other' ? asset.type : detectedType;
        const newAsset: MediaAsset = {
          ...asset,
          id,
          addedAt: Date.now(),
          folderId: asset.folderId !== undefined ? asset.folderId : state.currentFolderId,
          type: finalType,
        };

        set((state) => ({
          assets: {
            ...state.assets,
            [id]: newAsset,
          },
        }));

        return id;
      },
      
      addAssets: (assets) => {
        const ids: string[] = [];
        const state = get();
        const newAssets: Record<string, MediaAsset> = {};

        assets.forEach((asset) => {
          const id = `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const detectedType = getMediaType(asset.mimeType);
          const finalType: MediaType = asset.type && asset.type !== 'other' ? asset.type : detectedType;

          ids.push(id);
          newAssets[id] = {
            ...asset,
            id,
            addedAt: Date.now(),
            folderId: asset.folderId !== undefined ? asset.folderId : state.currentFolderId,
            type: finalType,
          };
        });

        set((state) => ({
          assets: { ...state.assets, ...newAssets },
        }));

        return ids;
      },
      
      removeAsset: (id) => {
        set((state) => {
          const newAssets = { ...state.assets };
          delete newAssets[id];
          return { 
            assets: newAssets,
            selectedIds: state.selectedIds.filter(sid => sid !== id),
          };
        });
      },
      
      removeAssets: (ids) => {
        set((state) => {
          const newAssets = { ...state.assets };
          ids.forEach(id => delete newAssets[id]);
          return { 
            assets: newAssets,
            selectedIds: state.selectedIds.filter(sid => !ids.includes(sid)),
          };
        });
      },
      
      updateAsset: (id, updates) => {
        set((state) => ({
          assets: {
            ...state.assets,
            [id]: { ...state.assets[id], ...updates },
          },
        }));
      },
      
      getAsset: (id) => {
        const state = get();
        return state.assets[id] || null;
      },
      
      getAllAssets: () => {
        const state = get();
        return Object.values(state.assets);
      },
      
      getFilteredAssets: () => {
        const state = get();
        let assets = Object.values(state.assets);
        
        // Filter by current folder
        assets = assets.filter(a => a.folderId === state.currentFolderId);
        
        // Filter by type
        if (state.filterType !== 'all') {
          assets = assets.filter(a => a.type === state.filterType);
        }
        
        // Filter by search
        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase();
          assets = assets.filter(a => 
            a.name.toLowerCase().includes(query) || 
            a.altText?.toLowerCase().includes(query)
          );
        }
        
        // Sort
        assets.sort((a, b) => {
          let comparison = 0;
          switch (state.sortField) {
            case 'name':
              comparison = a.name.localeCompare(b.name);
              break;
            case 'addedAt':
              comparison = a.addedAt - b.addedAt;
              break;
            case 'size':
              comparison = a.size - b.size;
              break;
          }
          return state.sortOrder === 'desc' ? -comparison : comparison;
        });
        
        return assets;
      },
      
      getAssetsInFolder: (folderId) => {
        const state = get();
        return Object.values(state.assets).filter(a => a.folderId === folderId);
      },
      
      // Folder Actions
      addFolder: (name, parentId = null) => {
        const id = `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const state = get();
        const newFolder: MediaFolder = {
          id,
          name,
          parentId: parentId !== undefined ? parentId : state.currentFolderId,
          createdAt: Date.now(),
        };
        
        set((state) => ({
          folders: {
            ...state.folders,
            [id]: newFolder,
          },
        }));
        
        return id;
      },
      
      removeFolder: (id) => {
        set((state) => {
          const newFolders = { ...state.folders };
          delete newFolders[id];
          
          // Also remove all assets in this folder and move them to parent
          const folder = state.folders[id];
          const updatedAssets = { ...state.assets };
          Object.values(updatedAssets).forEach(asset => {
            if (asset.folderId === id) {
              updatedAssets[asset.id] = { ...asset, folderId: folder?.parentId || null };
            }
          });
          
          // Remove subfolders recursively
          Object.values(newFolders).forEach(f => {
            if (f.parentId === id) {
              delete newFolders[f.id];
            }
          });
          
          return { 
            folders: newFolders,
            assets: updatedAssets,
            currentFolderId: state.currentFolderId === id ? folder?.parentId || null : state.currentFolderId,
          };
        });
      },
      
      renameFolder: (id, name) => {
        set((state) => ({
          folders: {
            ...state.folders,
            [id]: { ...state.folders[id], name },
          },
        }));
      },
      
      getFoldersInParent: (parentId) => {
        const state = get();
        return Object.values(state.folders).filter(f => f.parentId === parentId);
      },
      
      setCurrentFolder: (folderId) => {
        set({ currentFolderId: folderId, selectedIds: [] });
      },
      
      selectAsset: (id) => {
        set((state) => ({
          selectedIds: state.selectedIds.includes(id) 
            ? state.selectedIds 
            : [...state.selectedIds, id],
        }));
      },
      
      deselectAsset: (id) => {
        set((state) => ({
          selectedIds: state.selectedIds.filter(sid => sid !== id),
        }));
      },
      
      toggleAssetSelection: (id) => {
        set((state) => ({
          selectedIds: state.selectedIds.includes(id)
            ? state.selectedIds.filter(sid => sid !== id)
            : [...state.selectedIds, id],
        }));
      },
      
      selectAll: () => {
        const state = get();
        const filteredAssets = state.getFilteredAssets();
        set({ selectedIds: filteredAssets.map(a => a.id) });
      },
      
      clearSelection: () => {
        set({ selectedIds: [] });
      },
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilterType: (type) => set({ filterType: type }),
      setSortField: (field) => set({ sortField: field }),
      setSortOrder: (order) => set({ sortOrder: order }),
      setAutoCompress: (value) => set({ autoCompress: value }),
    }),
    {
      name: 'builder-media-store',
      version: 2,
      migrate: (persistedState: any) => {
        const safeState = persistedState || {};

        const rawAssets = safeState.assets && typeof safeState.assets === 'object' ? safeState.assets : {};
        const rawFolders = safeState.folders && typeof safeState.folders === 'object' ? safeState.folders : {};

        const assets: Record<string, MediaAsset> = {};
        for (const [key, value] of Object.entries(rawAssets)) {
          const a: any = value || {};
          const mimeType = typeof a.mimeType === 'string' ? a.mimeType : '';
          const detectedType = getMediaType(mimeType);
          const finalType: MediaType = a.type && a.type !== 'other' ? a.type : detectedType;

          assets[key] = {
            id: a.id || key,
            name: a.name || key,
            type: finalType,
            url: a.url || '',
            size: typeof a.size === 'number' ? a.size : 0,
            mimeType,
            altText: typeof a.altText === 'string' ? a.altText : '',
            addedAt: typeof a.addedAt === 'number' ? a.addedAt : Date.now(),
            folderId: a.folderId ?? null,
            width: typeof a.width === 'number' ? a.width : undefined,
            height: typeof a.height === 'number' ? a.height : undefined,
            duration: typeof a.duration === 'number' ? a.duration : undefined,
            compressed: typeof a.compressed === 'boolean' ? a.compressed : undefined,
          };
        }

        const folders: Record<string, MediaFolder> = {};
        for (const [key, value] of Object.entries(rawFolders)) {
          const f: any = value || {};
          folders[key] = {
            id: f.id || key,
            name: f.name || 'Folder',
            parentId: f.parentId ?? null,
            createdAt: typeof f.createdAt === 'number' ? f.createdAt : Date.now(),
          };
        }

        return {
          assets,
          folders,
          selectedIds: Array.isArray(safeState.selectedIds) ? safeState.selectedIds : [],
          currentFolderId: safeState.currentFolderId ?? null,
          searchQuery: typeof safeState.searchQuery === 'string' ? safeState.searchQuery : '',
          filterType: safeState.filterType || 'all',
          sortField: safeState.sortField || 'addedAt',
          sortOrder: safeState.sortOrder || 'desc',
          autoCompress: typeof safeState.autoCompress === 'boolean' ? safeState.autoCompress : true,
        };
      },
    }
  )
);

// Helper to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};