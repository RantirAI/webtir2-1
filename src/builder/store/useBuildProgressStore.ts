import { create } from 'zustand';

export interface BuildEdit {
  type: 'component' | 'style' | 'prop' | 'image';
  name: string;
  action: 'created' | 'updated' | 'deleted';
}

interface BuildProgressState {
  isBuilding: boolean;
  startTime: number | null;
  taskTitle: string;
  taskDescription: string;
  edits: BuildEdit[];
  isExpanded: boolean;
}

interface BuildProgressActions {
  startBuild: (taskTitle: string) => void;
  setTaskDescription: (description: string) => void;
  addEdit: (edit: BuildEdit) => void;
  finishBuild: () => void;
  reset: () => void;
  toggleExpanded: () => void;
}

type BuildProgressStore = BuildProgressState & BuildProgressActions;

export const useBuildProgressStore = create<BuildProgressStore>((set) => ({
  // Initial state
  isBuilding: false,
  startTime: null,
  taskTitle: '',
  taskDescription: '',
  edits: [],
  isExpanded: false,

  // Actions
  startBuild: (taskTitle: string) => set({
    isBuilding: true,
    startTime: Date.now(),
    taskTitle,
    taskDescription: 'Analyzing request...',
    edits: [],
    isExpanded: false,
  }),

  setTaskDescription: (description: string) => set({
    taskDescription: description,
  }),

  addEdit: (edit: BuildEdit) => set((state) => ({
    edits: [...state.edits, edit],
  })),

  finishBuild: () => set({
    isBuilding: false,
    taskDescription: 'Complete',
  }),

  reset: () => set({
    isBuilding: false,
    startTime: null,
    taskTitle: '',
    taskDescription: '',
    edits: [],
    isExpanded: false,
  }),

  toggleExpanded: () => set((state) => ({
    isExpanded: !state.isExpanded,
  })),
}));
