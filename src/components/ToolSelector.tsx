import React from 'react';
import { BookOpen, Brain, ListChecks, Download, Wand2 } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { ToolType, SummaryLength, QuizType, Difficulty } from '../types';

const tools = [
  {
    id: 'summarize' as ToolType,
    name: 'Summarize',
    icon: BookOpen,
    description: 'Generate a concise summary',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'flashcards' as ToolType,
    name: 'Flashcards',
    icon: Brain,
    description: 'Create study flashcards',
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'quiz' as ToolType,
    name: 'Quiz',
    icon: ListChecks,
    description: 'Generate practice questions',
    color: 'from-green-500 to-green-600',
  },
];

const summaryLengths: SummaryLength[] = ['short', 'medium', 'long'];
const quizTypes: QuizType[] = ['multiple-choice', 'true-false', 'fill-in-blanks'];
const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

export function ToolSelector() {
  const { selectedTool, setSelectedTool, toolSettings, updateToolSettings, inputText } = useChatStore();

  const processContent = async () => {
    const sentences = inputText
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10 && /[a-zA-Z]/.test(s));

    let response = '';
    switch (selectedTool) {
      case 'summarize': {
        const summaryLength = {
          short: Math.min(3, sentences.length),
          medium: Math.min(5, sentences.length),
          long: Math.min(7, sentences.length),
        }[toolSettings.summaryLength];
        
        const keyPoints = sentences
          .slice(0, summaryLength)
          .map(sentence => sentence.trim() + '.');
        
        response = `# Summary\n\n## Key Points\n\n${keyPoints.map(point => `• ${point}`).join('\n\n')}`;
        break;
      }
      
      case 'flashcards': {
        const flashcards = sentences
          .slice(0, toolSettings.numFlashcards)
          .map((sentence, index) => {
            const words = sentence.split(' ').filter(word => word.length > 3);
            const keyWord = words[Math.floor(Math.random() * words.length)];
            return `### Flashcard ${index + 1}\n\n**Question:** ${sentence.replace(keyWord, '_____')}.\n\n**Answer:** ${keyWord}`;
          });
        
        response = `# Study Flashcards\n\n${flashcards.join('\n\n')}`;
        break;
      }
      
      case 'quiz': {
        const questions = sentences
          .slice(0, toolSettings.numQuestions)
          .map((sentence, index) => {
            const words = sentence.split(' ').filter(word => word.length > 3);
            const keyWord = words[Math.floor(Math.random() * words.length)];
            
            if (toolSettings.quizType === 'multiple-choice') {
              const otherWords = words.filter(w => w !== keyWord && w.length > 3);
              const options = [
                keyWord,
                ...otherWords
                  .sort(() => Math.random() - 0.5)
                  .slice(0, 3)
              ].sort(() => Math.random() - 0.5);
              
              return `### Question ${index + 1}\n\n${sentence.replace(keyWord, '_____')}.\n\n${
                options.map((opt, i) => `${String.fromCharCode(97 + i)}) ${opt}`).join('\n')
              }\n\n**Correct Answer:** ${keyWord}`;
            }
            
            return `### Question ${index + 1}\n\n${sentence.replace(keyWord, '_____')}.\n\n**Answer:** ${keyWord}`;
          });
        
        response = `# ${toolSettings.difficulty.charAt(0).toUpperCase() + toolSettings.difficulty.slice(1)} ${
          toolSettings.quizType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        } Quiz\n\n${questions.join('\n\n')}`;
      }
    }

    return response;
  };

  const handleToolSelect = (toolId: ToolType) => {
    setSelectedTool(toolId);
  };

  const handleGenerate = async () => {
    // Clear existing messages first
    useChatStore.getState().messages = [];
    
    // Generate and set new content
    const response = await processContent();
    useChatStore.getState().messages = [{
      role: 'assistant',
      content: response,
      type: 'text',
      id: crypto.randomUUID()
    }];
  };

  const handleDownload = async () => {
    const content = await processContent();
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
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Learning Tools</h2>
        {selectedTool && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        )}
      </div>
      
      {tools.map((tool) => (
        <div key={tool.id} className="space-y-4">
          <button
            onClick={() => handleToolSelect(tool.id)}
            className={`
              w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300
              transform hover:scale-102
              ${selectedTool === tool.id
                ? `bg-gradient-to-br ${tool.color} text-white shadow-lg`
                : 'bg-white hover:bg-gray-50 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200'
              }
            `}
          >
            <div className={`
              w-10 h-10 rounded-lg flex items-center justify-center
              ${selectedTool === tool.id
                ? 'bg-white/20'
                : `bg-gradient-to-br ${tool.color} bg-opacity-10`
              }
            `}>
              <tool.icon className={`w-5 h-5 ${
                selectedTool === tool.id
                  ? 'text-white'
                  : `bg-gradient-to-br ${tool.color} bg-clip-text text-transparent`
              }`} />
            </div>
            
            <div className="flex-1 text-left">
              <div className="font-medium">{tool.name}</div>
              <p className={`text-sm ${
                selectedTool === tool.id ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {tool.description}
              </p>
            </div>
          </button>

          {selectedTool === tool.id && (
            <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-6">
              {tool.id === 'summarize' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Summary Length</label>
                  <div className="grid grid-cols-3 gap-2">
                    {summaryLengths.map((length) => (
                      <button
                        key={length}
                        onClick={() => updateToolSettings({ summaryLength: length })}
                        className={`
                          px-3 py-2 rounded-lg text-sm font-medium
                          transition-all duration-300
                          ${toolSettings.summaryLength === length
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                          }
                        `}
                      >
                        {length.charAt(0).toUpperCase() + length.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {tool.id === 'flashcards' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Number of Flashcards: {toolSettings.numFlashcards}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={toolSettings.numFlashcards}
                    onChange={(e) => updateToolSettings({
                      numFlashcards: parseInt(e.target.value)
                    })}
                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer dark:bg-purple-900"
                  />
                </div>
              )}

              {tool.id === 'quiz' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Question Type</label>
                    <div className="flex flex-col gap-2">
                      {quizTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => updateToolSettings({ quizType: type })}
                          className={`
                            px-3 py-2 rounded-lg text-sm font-medium text-left
                            transition-all duration-300
                            ${toolSettings.quizType === type
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                            }
                          `}
                        >
                          {type.split('-').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty</label>
                    <div className="grid grid-cols-3 gap-2">
                      {difficulties.map((level) => (
                        <button
                          key={level}
                          onClick={() => updateToolSettings({ difficulty: level })}
                          className={`
                            px-3 py-2 rounded-lg text-sm font-medium
                            transition-all duration-300
                            ${toolSettings.difficulty === level
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                            }
                          `}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Number of Questions: {toolSettings.numQuestions}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={toolSettings.numQuestions}
                      onChange={(e) => updateToolSettings({
                        numQuestions: parseInt(e.target.value)
                      })}
                      className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer dark:bg-green-900"
                    />
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                className={`
                  w-full px-4 py-3 rounded-xl text-white font-medium
                  transition-all duration-300 transform hover:scale-105
                  flex items-center justify-center gap-2
                  ${selectedTool === 'summarize'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-blue-200 dark:hover:shadow-blue-900'
                    : selectedTool === 'flashcards'
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-purple-200 dark:hover:shadow-purple-900'
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:shadow-green-200 dark:hover:shadow-green-900'
                  }
                  shadow-lg hover:shadow-xl
                `}
              >
                <Wand2 className="w-5 h-5" />
                <span>Generate {selectedTool === 'summarize' ? 'Summary' : selectedTool === 'flashcards' ? 'Flashcards' : 'Quiz'}</span>
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}