import { create } from 'zustand';

export interface BuildEdit {
  type: 'component' | 'style' | 'prop' | 'image';
  name: string;
  action: 'created' | 'updated' | 'deleted';
}

export interface BuildStep {
  type: 'analyzing' | 'reading' | 'creating' | 'styling' | 'generating';
  description: string;
  detail?: string;
  target?: string;
  completed: boolean;
}

export interface BuildSummary {
  duration: number;
  edits: BuildEdit[];
  steps: BuildStep[];
  taskTitle: string;
  message: string;
}

interface BuildProgressState {
  isBuilding: boolean;
  startTime: number | null;
  taskTitle: string;
  taskDescription: string;
  edits: BuildEdit[];
  steps: BuildStep[];
  // Completed build summary for display
  lastBuildSummary: BuildSummary | null;
  // Truncation tracking for auto-continue
  isTruncated: boolean;
  truncatedComponentsCount: number;
}

interface BuildProgressActions {
  startBuild: (taskTitle: string) => void;
  setTaskDescription: (description: string) => void;
  addEdit: (edit: BuildEdit) => void;
  addStep: (step: Omit<BuildStep, 'completed'>) => void;
  completeLastStep: () => void;
  finishBuild: () => BuildSummary;
  reset: () => void;
  clearLastSummary: () => void;
  setTruncated: (isTruncated: boolean, count?: number) => void;
}

type BuildProgressStore = BuildProgressState & BuildProgressActions;

export const useBuildProgressStore = create<BuildProgressStore>((set, get) => ({
  // Initial state
  isBuilding: false,
  startTime: null,
  taskTitle: '',
  taskDescription: '',
  edits: [],
  steps: [],
  lastBuildSummary: null,
  isTruncated: false,
  truncatedComponentsCount: 0,

  // Actions
  startBuild: (taskTitle: string) => set({
    isBuilding: true,
    startTime: Date.now(),
    taskTitle,
    taskDescription: 'Analyzing request...',
    edits: [],
    steps: [{
      type: 'analyzing',
      description: 'Analyzing your request',
      detail: 'Understanding what to build...',
      completed: false,
    }],
    lastBuildSummary: null,
  }),

  setTaskDescription: (description: string) => set({
    taskDescription: description,
  }),

  addEdit: (edit: BuildEdit) => set((state) => ({
    edits: [...state.edits, edit],
  })),

  addStep: (step: Omit<BuildStep, 'completed'>) => set((state) => {
    // Complete the previous step if it exists
    const updatedSteps = state.steps.map((s, i) => 
      i === state.steps.length - 1 ? { ...s, completed: true } : s
    );
    return {
      steps: [...updatedSteps, { ...step, completed: false }],
      taskDescription: step.description,
    };
  }),

  completeLastStep: () => set((state) => ({
    steps: state.steps.map((s, i) => 
      i === state.steps.length - 1 ? { ...s, completed: true } : s
    ),
  })),

  finishBuild: () => {
    const state = get();
    const duration = state.startTime ? Math.floor((Date.now() - state.startTime) / 1000) : 0;
    
    // Complete all steps
    const completedSteps = state.steps.map(s => ({ ...s, completed: true }));
    
    const summary: BuildSummary = {
      duration,
      edits: [...state.edits],
      steps: completedSteps,
      taskTitle: state.taskTitle,
      message: '', // Will be set by AIChat when adding the message
    };
    
    set({
      isBuilding: false,
      taskDescription: 'Complete',
      steps: completedSteps,
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
    steps: [],
    lastBuildSummary: null,
    isTruncated: false,
    truncatedComponentsCount: 0,
  }),

  clearLastSummary: () => set({
    lastBuildSummary: null,
  }),

  setTruncated: (isTruncated: boolean, count?: number) => set({
    isTruncated,
    truncatedComponentsCount: count || 0,
  }),
}));
