import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'font' | 'code' | 'other';

export interface MediaAsset {
  id: string;
  name: string;
  type: MediaType;
  url: string;
  size: number;
  mimeType: string;
  altText: string;
  addedAt: number;
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
  selectedIds: string[];
  searchQuery: string;
  filterType: FilterType;
  sortField: SortField;
  sortOrder: SortOrder;
  autoCompress: boolean;
  
  // Actions
  addAsset: (asset: Omit<MediaAsset, 'id' | 'addedAt'>) => string;
  addAssets: (assets: Omit<MediaAsset, 'id' | 'addedAt'>[]) => string[];
  removeAsset: (id: string) => void;
  removeAssets: (ids: string[]) => void;
  updateAsset: (id: string, updates: Partial<MediaAsset>) => void;
  getAsset: (id: string) => MediaAsset | null;
  getAllAssets: () => MediaAsset[];
  getFilteredAssets: () => MediaAsset[];
  
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
      selectedIds: [],
      searchQuery: '',
      filterType: 'all',
      sortField: 'addedAt',
      sortOrder: 'desc',
      autoCompress: true,
      
      addAsset: (asset) => {
        const id = `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newAsset: MediaAsset = {
          ...asset,
          id,
          addedAt: Date.now(),
          type: asset.type || getMediaType(asset.mimeType),
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
        const newAssets: Record<string, MediaAsset> = {};
        
        assets.forEach((asset) => {
          const id = `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          ids.push(id);
          newAssets[id] = {
            ...asset,
            id,
            addedAt: Date.now(),
            type: asset.type || getMediaType(asset.mimeType),
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