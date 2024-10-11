'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// 删除这一行
// import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  isLoading?: boolean; // Add this line
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  createNewConversation: () => void;
  sendMessage: (content: string) => Promise<void>;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, newTitle: string) => void;
  setCurrentConversation: (id: string) => void;
  // Remove isLoading from here
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  // Remove isLoading state from here

  useEffect(() => {
    // Load conversations from local storage
    const savedConversations = localStorage.getItem('conversations');
    if (savedConversations) {
      const parsedConversations = JSON.parse(savedConversations);
      setConversations(parsedConversations);
      // Set the first conversation as current if it exists
      if (parsedConversations.length > 0) {
        setCurrentConversation(parsedConversations[0]);
      } else {
        createNewConversation();
      }
    } else {
      createNewConversation();
    }
  }, []);

  useEffect(() => {
    // Save conversations to local storage
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  const createNewConversation = async () => {
    try {
      const response = await fetch('/api/chat/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create new conversation');
      }

      const data = await response.json();
      const newConversation: Conversation = {
        id: data.conversation_id,
        title: 'New Conversation',
        messages: [],
      };

      setConversations(prevConversations => [...prevConversations, newConversation]);
      setCurrentConversation(newConversation);
    } catch (error) {
      console.error('Error creating new conversation:', error);
      // TODO: Implement error handling
    }
  };

  const sendMessage = async (content: string) => {
    if (!currentConversation) {
      await createNewConversation();
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content,
      sender: 'user',
    };

    const updatedConversation = {
      ...currentConversation!,
      messages: [...currentConversation!.messages, userMessage],
    };

    setCurrentConversation(updatedConversation as Conversation);
    setConversations(conversations.map(conv => 
      conv.id === updatedConversation.id ? updatedConversation as Conversation : conv
    ));

    // Remove this line
    // setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: content, conversationId: currentConversation!.id }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: '',
        sender: 'ai',
        isLoading: true, // Add this line
      };

      setCurrentConversation(prev => ({
        ...prev!,
        messages: [...prev!.messages, aiMessage],
      }));

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(5));
              if (data.content && data.content.length > 0) {
                const content = data.content[0];
                if (content.event_type === 'ChatAgent' && content.outputs && content.outputs.text) {
                  setCurrentConversation(prev => {
                    const updatedMessages = prev!.messages.map(msg =>
                      msg.id === aiMessage.id ? { ...msg, content: msg.content + content.outputs.text, isLoading: false } : msg
                    );
                    return { ...prev!, messages: updatedMessages };
                  });
                }
              }
            } catch (error) {
              console.error('Error parsing JSON:', error);
            }
          }
        }
      }

      setConversations(prev => 
        prev.map(conv => conv.id === currentConversation!.id ? currentConversation! : conv)
      );
    } catch (error) {
      console.error('Error sending message to AI:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: error instanceof Error && error.name === 'AbortError' 
          ? 'Error: Request timed out. Please try again.'
          : `Error: ${error instanceof Error ? error.message : 'Failed to get response from AI'}`,
        sender: 'ai',
        isLoading: false, // Add this line
      };
      setCurrentConversation(prev => ({
        ...prev!,
        messages: [...prev!.messages, errorMessage],
      }));
    } 
    // Remove this finally block
    // finally {
    //   setIsLoading(false);
    // }
  };

  const deleteConversation = (id: string) => {
    setConversations(conversations.filter(conv => conv.id !== id));
    if (currentConversation?.id === id) {
      setCurrentConversation(conversations[0] || null);
    }
  };

  const renameConversation = (id: string, newTitle: string) => {
    setConversations(conversations.map(conv => 
      conv.id === id ? { ...conv, title: newTitle } : conv
    ));
  };

  const setConversationById = (id: string) => {
    const conversation = conversations.find(conv => conv.id === id);
    if (conversation) {
      setCurrentConversation(conversation);
    }
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      currentConversation,
      createNewConversation,
      sendMessage,
      deleteConversation,
      renameConversation,
      setCurrentConversation: setConversationById,
      // Remove isLoading from here
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// TODO: Implement this function to interact with AppBuilder API
async function sendMessageToAI(content: string, conversationId: string): Promise<string> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: content, conversationId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to send message to AI: ${response.statusText}. ${errorData.details || ''}`);
    }

    const reader = response.body?.getReader();
    let result = '';

    while (true) {
      const { done, value } = await reader?.read() ?? { done: true, value: undefined };
      if (done) break;
      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const jsonData = JSON.parse(line.slice(6));
            if (jsonData.event === 'message') {
              result += jsonData.data;
            }
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        }
      }
    }

    return result;
  } catch (error) {
    console.error('Error in sendMessageToAI:', error);
    throw error;
  }
}