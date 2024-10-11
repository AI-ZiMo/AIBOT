'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Menu, X, Plus, Trash2, Edit2 } from 'lucide-react';
import { useChat } from '@/lib/contexts/ChatContext';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { conversations, currentConversation, createNewConversation, deleteConversation, renameConversation, setCurrentConversation } = useChat();

  const handleNewConversation = () => {
    createNewConversation();
    setIsOpen(false);
  };

  const handleDeleteConversation = (id: string) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      deleteConversation(id);
    }
  };

  const handleRenameConversation = (id: string) => {
    const newTitle = window.prompt('Enter new conversation title:');
    if (newTitle) {
      renameConversation(id, newTitle);
    }
  };

  return (
    <>
      <Button
        className="lg:hidden fixed top-4 left-4 z-20"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-10 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="h-full px-4 py-6 flex flex-col">
          <Button onClick={handleNewConversation} className="mb-4">
            <Plus className="mr-2 h-4 w-4" /> New Conversation
          </Button>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Chat History</h2>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-2 mb-2 rounded cursor-pointer flex items-center justify-between ${
                  currentConversation?.id === conv.id ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setCurrentConversation(conv.id)}
              >
                <span className="truncate flex-1">{conv.title}</span>
                <div className="flex space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => handleRenameConversation(conv.id)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteConversation(conv.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Settings</h3>
            {/* Add settings options here */}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;