import { create } from 'zustand';

export interface BuildEdit {
  type: 'component' | 'style' | 'prop' | 'image';
  name: string;
  action: 'created' | 'updated' | 'deleted';
}

export interface BuildSummary {
  duration: number;
  edits: BuildEdit[];
  taskTitle: string;
  message: string;
}

interface BuildProgressState {
  isBuilding: boolean;
  startTime: number | null;
  taskTitle: string;
  taskDescription: string;
  edits: BuildEdit[];
  // Completed build summary for display
  lastBuildSummary: BuildSummary | null;
}

interface BuildProgressActions {
  startBuild: (taskTitle: string) => void;
  setTaskDescription: (description: string) => void;
  addEdit: (edit: BuildEdit) => void;
  finishBuild: () => BuildSummary;
  reset: () => void;
  clearLastSummary: () => void;
}

type BuildProgressStore = BuildProgressState & BuildProgressActions;

export const useBuildProgressStore = create<BuildProgressStore>((set, get) => ({
  // Initial state
  isBuilding: false,
  startTime: null,
  taskTitle: '',
  taskDescription: '',
  edits: [],
  lastBuildSummary: null,

  // Actions
  startBuild: (taskTitle: string) => set({
    isBuilding: true,
    startTime: Date.now(),
    taskTitle,
    taskDescription: 'Analyzing request...',
    edits: [],
    lastBuildSummary: null,
  }),

  setTaskDescription: (description: string) => set({
    taskDescription: description,
  }),

  addEdit: (edit: BuildEdit) => set((state) => ({
    edits: [...state.edits, edit],
  })),

  finishBuild: () => {
    const state = get();
    const duration = state.startTime ? Math.floor((Date.now() - state.startTime) / 1000) : 0;
    const summary: BuildSummary = {
      duration,
      edits: [...state.edits],
      taskTitle: state.taskTitle,
      message: '', // Will be set by AIChat when adding the message
    };
    
    set({
      isBuilding: false,
      taskDescription: 'Complete',
      lastBuildSummary: summary,
    });
    
    return summary;
  },

  reset: () => set({
    isBuilding: false,
    startTime: null,
    taskTitle: '',
    taskDescription: '',
    edits: [],
    lastBuildSummary: null,
  }),

  clearLastSummary: () => set({
    lastBuildSummary: null,
  }),
}));
