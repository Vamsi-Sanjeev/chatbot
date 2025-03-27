export type SummaryLength = 'short' | 'medium' | 'long';
export type QuizType = 'multiple-choice' | 'true-false' | 'fill-in-blanks';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type ToolType = 'summarize' | 'flashcards' | 'quiz';

export interface ToolSettings {
  summaryLength: SummaryLength;
  quizType: QuizType;
  difficulty: Difficulty;
  numQuestions: number;
  numFlashcards: number;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'file';
  fileName?: string;
}