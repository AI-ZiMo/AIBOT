'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  isLoading?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div className={`flex items-start ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      {message.sender === 'ai' && (
        <div className="w-8 h-8 mr-2 flex items-center justify-center">
          {message.isLoading ? (
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          ) : (
            <Bot className="w-8 h-8 text-blue-500" />
          )}
        </div>
      )}
      <div
        className={`max-w-3/4 p-3 rounded-lg ${
          message.sender === 'user'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
        }`}
      >
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>
      {message.sender === 'user' && (
        <User className="w-8 h-8 ml-2 text-blue-500" />
      )}
    </div>
  );
};

export default ChatMessage;