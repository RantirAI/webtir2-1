import { create } from 'zustand';

interface MediaAsset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'lottie' | 'audio' | 'other';
  url: string;
  size?: number;
  addedAt: number;
}

interface MediaStore {
  assets: Record<string, MediaAsset>;
  
  addAsset: (asset: Omit<MediaAsset, 'id' | 'addedAt'>) => string;
  removeAsset: (id: string) => void;
  getAsset: (id: string) => MediaAsset | null;
  getAllAssets: () => MediaAsset[];
  getAssetsByType: (type: MediaAsset['type']) => MediaAsset[];
}

export const useMediaStore = create<MediaStore>((set, get) => ({
  assets: {},
  
  addAsset: (asset) => {
    const id = `asset-${Date.now()}`;
    const newAsset: MediaAsset = {
      ...asset,
      id,
      addedAt: Date.now(),
    };
    
    set((state) => ({
      assets: {
        ...state.assets,
        [id]: newAsset,
      },
    }));
    
    return id;
  },
  
  removeAsset: (id) => {
    set((state) => {
      const newAssets = { ...state.assets };
      delete newAssets[id];
      return { assets: newAssets };
    });
  },
  
  getAsset: (id) => {
    const state = get();
    return state.assets[id] || null;
  },
  
  getAllAssets: () => {
    const state = get();
    return Object.values(state.assets).sort((a, b) => b.addedAt - a.addedAt);
  },
  
  getAssetsByType: (type) => {
    const state = get();
    return Object.values(state.assets)
      .filter((asset) => asset.type === type)
      .sort((a, b) => b.addedAt - a.addedAt);
  },
}));
