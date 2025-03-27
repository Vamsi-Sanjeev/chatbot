import React from 'react';
import { useChatStore } from '../store/chatStore';
import { SummaryLength, QuizType, Difficulty } from '../types';
import { Sliders, Clock, Brain as BrainIcon, Target } from 'lucide-react';

export function ToolSettings() {
  const { selectedTool, toolSettings, updateToolSettings } = useChatStore();

  const summaryLengths: SummaryLength[] = ['short', 'medium', 'long'];
  const quizTypes: QuizType[] = ['multiple-choice', 'true-false', 'fill-in-blanks'];
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

  return (
    <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
      <div className="flex items-center gap-2 mb-4 text-gray-600">
        <Sliders className="w-5 h-5" />
        <h2 className="font-semibold">Customize Settings</h2>
      </div>
      
      <div className="space-y-6">
        {selectedTool === 'summarize' && (
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-gray-700">
              <Clock className="w-4 h-4" />
              <label className="text-sm font-medium">Summary Length</label>
            </div>
            <div className="flex gap-2">
              {summaryLengths.map((length) => (
                <button
                  key={length}
                  onClick={() => updateToolSettings({ summaryLength: length })}
                  className={`
                    flex-1 px-4 py-2 rounded-lg text-sm font-medium
                    transition-all duration-300
                    ${toolSettings.summaryLength === length
                      ? 'bg-blue-600 text-white shadow-md transform scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {length.charAt(0).toUpperCase() + length.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedTool === 'quiz' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-gray-700">
                <BrainIcon className="w-4 h-4" />
                <label className="text-sm font-medium">Question Type</label>
              </div>
              <div className="flex gap-2">
                {quizTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => updateToolSettings({ quizType: type })}
                    className={`
                      flex-1 px-4 py-2 rounded-lg text-sm font-medium
                      transition-all duration-300
                      ${toolSettings.quizType === type
                        ? 'bg-purple-600 text-white shadow-md transform scale-105'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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

            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-gray-700">
                <Target className="w-4 h-4" />
                <label className="text-sm font-medium">Difficulty Level</label>
              </div>
              <div className="flex gap-2">
                {difficulties.map((level) => (
                  <button
                    key={level}
                    onClick={() => updateToolSettings({ difficulty: level })}
                    className={`
                      flex-1 px-4 py-2 rounded-lg text-sm font-medium
                      transition-all duration-300
                      ${toolSettings.difficulty === level
                        ? 'bg-green-600 text-white shadow-md transform scale-105'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={toolSettings.numQuestions}
                onChange={(e) => updateToolSettings({
                  numQuestions: parseInt(e.target.value)
                })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-center mt-2 text-sm font-medium text-gray-600">
                {toolSettings.numQuestions} questions
              </div>
            </div>
          </div>
        )}

        {selectedTool === 'flashcards' && (
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Flashcards
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={toolSettings.numFlashcards}
              onChange={(e) => updateToolSettings({
                numFlashcards: parseInt(e.target.value)
              })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center mt-2 text-sm font-medium text-gray-600">
              {toolSettings.numFlashcards} flashcards
            </div>
          </div>
        )}
      </div>
    </div>
  );
}