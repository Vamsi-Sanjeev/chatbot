import React, { useState } from 'react';
import { Bot, User, FileText, Trash2, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage as ChatMessageType } from '../types';
import { useChatStore } from '../store/chatStore';

interface Props {
  message: ChatMessageType;
}

export function ChatMessage({ message }: Props) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const isBot = message.role === 'assistant';
  const isFile = message.type === 'file';
  const removeMessage = useChatStore((state) => state.removeMessage);
  const selectedTool = useChatStore((state) => state.selectedTool);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getToolColor = () => {
    switch (selectedTool) {
      case 'summarize': return 'from-blue-50/50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/30';
      case 'flashcards': return 'from-purple-50/50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/30';
      case 'quiz': return 'from-green-50/50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/30';
      default: return 'from-gray-50/50 to-gray-100/50 dark:from-gray-950/30 dark:to-gray-900/30';
    }
  };

  const getToolAccentColor = () => {
    switch (selectedTool) {
      case 'summarize': return 'text-blue-600 dark:text-blue-400';
      case 'flashcards': return 'text-purple-600 dark:text-purple-400';
      case 'quiz': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className={`
      message-animation relative group
      ${isBot ? `bg-gradient-to-r ${getToolColor()}` : 'bg-white/50 dark:bg-gray-800/50'}
      hover:shadow-lg transition-all duration-300 ease-in-out
      border-b border-gray-100 dark:border-gray-800
    `}>
      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {isBot && (
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 tooltip-container"
          >
            <Copy className={`w-4 h-4 ${copied ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}`} />
            <span className="tooltip">
              {copied ? 'Copied!' : 'Copy content'}
            </span>
          </button>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 tooltip-container"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="tooltip">Collapse</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="tooltip">Expand</span>
            </>
          )}
        </button>
        <button
          onClick={() => removeMessage(message.id!)}
          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 tooltip-container"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
          <span className="tooltip">Delete message</span>
        </button>
      </div>

      <div className="flex gap-4 p-6">
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center shrink-0
          ${isBot
            ? `bg-gradient-to-br ${
                selectedTool === 'summarize' ? 'from-blue-500 to-blue-600' :
                selectedTool === 'flashcards' ? 'from-purple-500 to-purple-600' :
                'from-green-500 to-green-600'
              } text-white`
            : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-600 dark:text-gray-300'
          }
          transform transition-transform duration-300 group-hover:scale-110
        `}>
          {isBot ? <Bot className="w-6 h-6" /> : <User className="w-6 h-6" />}
        </div>

        <div className="flex-1 space-y-2 pr-20">
          {isFile && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3 bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-lg inline-block">
              <FileText className="w-4 h-4" />
              <span className="font-medium">{message.fileName}</span>
            </div>
          )}
          
          <div className={`prose prose-blue dark:prose-invert max-w-none transition-all duration-300 ${
            isExpanded ? 'opacity-100' : 'opacity-50 max-h-20 overflow-hidden'
          }`}>
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className={`text-2xl font-bold mb-4 pb-2 border-b ${
                    selectedTool === 'summarize' ? 'text-blue-800 border-blue-200 dark:text-blue-300 dark:border-blue-800' :
                    selectedTool === 'flashcards' ? 'text-purple-800 border-purple-200 dark:text-purple-300 dark:border-purple-800' :
                    'text-green-800 border-green-200 dark:text-green-300 dark:border-green-800'
                  }`}>{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className={`text-lg font-medium mb-2 ${getToolAccentColor()}`}>{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-2 mb-4">{children}</ul>
                ),
                li: ({ children }) => (
                  <li className="flex items-start gap-2">
                    <span className={`w-2 h-2 rounded-full mt-2 ${
                      selectedTool === 'summarize' ? 'bg-blue-500 dark:bg-blue-400' :
                      selectedTool === 'flashcards' ? 'bg-purple-500 dark:bg-purple-400' :
                      'bg-green-500 dark:bg-green-400'
                    }`} />
                    <span className="flex-1 text-gray-600 dark:text-gray-400">{children}</span>
                  </li>
                ),
                hr: () => (
                  <hr className={`my-6 ${
                    selectedTool === 'summarize' ? 'border-blue-200 dark:border-blue-800' :
                    selectedTool === 'flashcards' ? 'border-purple-200 dark:border-purple-800' :
                    'border-green-200 dark:border-green-800'
                  }`} />
                ),
                strong: ({ children }) => (
                  <strong className={getToolAccentColor()}>{children}</strong>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}