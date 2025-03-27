import React, { useState } from 'react';
import { Send, Loader2, Sparkles, Download } from 'lucide-react';
import { useChatStore } from '../store/chatStore';

export function ChatInput() {
  const [input, setInput] = useState('');
  const { addMessage, isProcessing, selectedTool, toolSettings, setIsProcessing } = useChatStore();

  const processText = async (text: string) => {
    let response = '';
    
    // Optimized text processing for instant feedback
    const sentences = text
      .split(/[.!?]+\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    switch (selectedTool) {
      case 'summarize': {
        const summaryLength = {
          short: Math.min(3, sentences.length),
          medium: Math.min(5, sentences.length),
          long: Math.min(7, sentences.length),
        }[toolSettings.summaryLength];
        
        const keyPoints = sentences.slice(0, summaryLength);
        response = `# Summary\n\n## Key Points\n\n${keyPoints.map(point => `• ${point}`).join('\n\n')}`;
        break;
      }
      
      case 'flashcards': {
        const flashcards = sentences
          .slice(0, toolSettings.numFlashcards)
          .map((sentence, index) => {
            const words = sentence.split(' ').filter(w => w.length > 3);
            const keyWord = words[Math.floor(Math.random() * words.length)];
            return `### Card ${index + 1}\n\n**Front:** ${sentence.replace(keyWord, '_____')}\n\n**Back:** ${keyWord}`;
          });
        
        response = `# Study Flashcards\n\n${flashcards.join('\n\n---\n\n')}`;
        break;
      }
      
      case 'quiz': {
        const questions = sentences
          .slice(0, toolSettings.numQuestions)
          .map((sentence, index) => {
            const words = sentence.split(' ').filter(w => w.length > 3);
            const keyWord = words[Math.floor(Math.random() * words.length)];
            
            if (toolSettings.quizType === 'multiple-choice') {
              const otherWords = words.filter(w => w !== keyWord);
              const options = [
                keyWord,
                ...otherWords
                  .sort(() => Math.random() - 0.5)
                  .slice(0, 3)
              ].sort(() => Math.random() - 0.5);
              
              return `### Question ${index + 1}\n\n${sentence.replace(keyWord, '_____')}\n\n${
                options.map((opt, i) => `${String.fromCharCode(97 + i)}) ${opt}`).join('\n')
              }\n\n**Correct Answer:** ${keyWord}`;
            }
            
            return `### Question ${index + 1}\n\n${sentence.replace(keyWord, '_____')}\n\n**Answer:** ${keyWord}`;
          });
        
        response = `# ${toolSettings.difficulty.charAt(0).toUpperCase() + toolSettings.difficulty.slice(1)} ${
          toolSettings.quizType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        } Quiz\n\n${questions.join('\n\n---\n\n')}`;
      }
    }
    
    return response;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    // Clear previous messages for cleaner output
    useChatStore.getState().messages = [];

    const userMessage = {
      role: 'user' as const,
      content: input,
      type: 'text' as const,
    };

    addMessage(userMessage);
    setInput('');
    setIsProcessing(true);

    try {
      const response = await processText(input);
      
      addMessage({
        role: 'assistant',
        content: response,
        type: 'text',
      });
    } catch (error) {
      console.error('Error processing request:', error);
      addMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        type: 'text',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!input.trim()) return;
    
    try {
      const content = await processText(input);
      const fileName = `${selectedTool}-${new Date().toISOString().split('T')[0]}.md`;
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading content:', error);
    }
  };

  return (
    <div className={`border-t p-6 transition-colors duration-300 ${
      selectedTool === 'summarize' ? 'bg-blue-50/80 dark:bg-blue-950/20' :
      selectedTool === 'flashcards' ? 'bg-purple-50/80 dark:bg-purple-950/20' :
      'bg-green-50/80 dark:bg-green-950/20'
    }`}>
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            selectedTool === 'summarize' ? "Enter text to summarize..." :
            selectedTool === 'flashcards' ? "Enter content for flashcards..." :
            "Enter text for quiz generation..."
          }
          className={`w-full px-6 py-4 rounded-xl border-2 focus:ring-2 transition-all duration-300 pr-32 min-h-[100px] resize-y
            dark:bg-gray-800 dark:text-white
            ${selectedTool === 'summarize' 
              ? 'border-blue-200 focus:border-blue-500 focus:ring-blue-200 dark:border-blue-800 dark:focus:border-blue-600' 
              : selectedTool === 'flashcards'
                ? 'border-purple-200 focus:border-purple-500 focus:ring-purple-200 dark:border-purple-800 dark:focus:border-purple-600'
                : 'border-green-200 focus:border-green-500 focus:ring-green-200 dark:border-green-800 dark:focus:border-green-600'
            }`}
          disabled={isProcessing}
        />
        <div className="absolute right-2 bottom-2 flex gap-2">
          {!isProcessing && input.trim() && (
            <>
              <button
                type="button"
                onClick={handleDownload}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 hover:scale-110 ${
                  selectedTool === 'summarize' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' :
                  selectedTool === 'flashcards' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400' :
                  'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                }`}
              >
                <Download className="w-4 h-4" />
              </button>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                selectedTool === 'summarize' ? 'bg-blue-100 dark:bg-blue-900' :
                selectedTool === 'flashcards' ? 'bg-purple-100 dark:bg-purple-900' :
                'bg-green-100 dark:bg-green-900'
              }`}>
                <Sparkles className={`w-4 h-4 ${
                  selectedTool === 'summarize' ? 'text-blue-600 dark:text-blue-400' :
                  selectedTool === 'flashcards' ? 'text-purple-600 dark:text-purple-400' :
                  'text-green-600 dark:text-green-400'
                }`} />
              </div>
            </>
          )}
          <button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className={`
              px-4 py-2 rounded-lg flex items-center gap-2
              transition-all duration-300 transform hover:scale-105
              ${isProcessing || !input.trim()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                : selectedTool === 'summarize'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg dark:from-blue-600 dark:to-blue-700'
                  : selectedTool === 'flashcards'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg dark:from-purple-600 dark:to-purple-700'
                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg dark:from-green-600 dark:to-green-700'
              }
            `}
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}