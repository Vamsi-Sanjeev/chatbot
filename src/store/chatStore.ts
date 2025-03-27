import { create } from 'zustand';
import { ToolType, ToolSettings, ChatMessage } from '../types';

interface AppState {
  messages: ChatMessage[];
  isProcessing: boolean;
  selectedTool: ToolType;
  toolSettings: ToolSettings;
  inputText: string;
  setInputText: (text: string) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setSelectedTool: (tool: ToolType) => void;
  updateToolSettings: (settings: Partial<ToolSettings>) => void;
  addMessage: (message: ChatMessage) => void;
  removeMessage: (id: string) => void;
}

const defaultToolSettings: ToolSettings = {
  summaryLength: 'medium',
  quizType: 'multiple-choice',
  difficulty: 'medium',
  numQuestions: 5,
  numFlashcards: 10,
};

export const useChatStore = create<AppState>((set) => ({
  messages: [],
  isProcessing: false,
  selectedTool: 'summarize',
  toolSettings: defaultToolSettings,
  inputText: '',
  setInputText: (text) => set({ inputText: text }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setSelectedTool: (tool) => set({ selectedTool: tool }),
  updateToolSettings: (settings) =>
    set((state) => ({
      toolSettings: { ...state.toolSettings, ...settings },
    })),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, { ...message, id: crypto.randomUUID() }],
    })),
  removeMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== id),
    })),
}));