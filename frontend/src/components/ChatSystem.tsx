// ChatSystem.tsx - COMPLETE FIXED VERSION
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { MessageSquare, Send, Users, Search, Plus, User } from 'lucide-react';
import { toast } from 'sonner';

interface Chat {
  id: string;
  participant_one_id: string;
  participant_two_id: string;
  job_id?: string;
  last_message_at: string;
  other_user: {
    id: string;
    name: string;
    username: string;
    avatar_url?: string;
  };
  last_message?: {
    content: string;
    created_at: string;
    is_read: boolean;
  };
  unread_count: number;
}

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  created_at: string;
  is_read: boolean;
}

interface LocationState {
  autoSelectChat?: boolean;
  autoSelectChatId?: string;
  workerUserId?: string;
}

export const ChatSystem = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showWorkerList, setShowWorkerList] = useState(false);
  const [availableWorkers, setAvailableWorkers] = useState<any[]>([]);
  const locationState = location.state as LocationState;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    
    // If user is employer, fetch available workers for chat initiation
    if (user?.role === 'employer') {
      fetchAvailableWorkers();
    }
  }, [user]);

  // Fetch chats on mount and when locationState changes
  useEffect(() => {
    if (user) {
      fetchChats(true); // Show loading on initial fetch
    }
  }, [user, locationState?.autoSelectChatId]);

  useEffect(() => {
    // Handle auto-selection from navigation - FIXED VERSION
    if (locationState?.autoSelectChatId) {
      const chatId = locationState.autoSelectChatId;
      const targetChat = chats.find(chat => chat.id === chatId);
      
      if (targetChat) {
        setSelectedChat(targetChat);
        // Clear the location state after successful selection
        navigate(location.pathname, { replace: true, state: {} });
      } else {
        // Chat might not be loaded yet, we'll handle it after fetchChats completes
      }
    }
  }, [chats, locationState, navigate, location.pathname]);

  useEffect(() => {
    if (selectedChat && selectedChat.id) {
      const chatId = selectedChat.id;
      fetchMessages(chatId);
      const interval = setInterval(() => {
        fetchMessages(chatId);
        // Refresh chat list less frequently to avoid re-renders
        fetchChats();
      }, 3000);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [selectedChat]);

  const fetchAvailableWorkers = async () => {
    try {
      const response = await fetch('https://verinest.up.railway.app/api/labour/workers/search?limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableWorkers(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch workers:', error);
    }
  };

  const fetchChats = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const response = await fetch('https://verinest.up.railway.app/api/chat/chats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Handle both data.data and data.message response formats
        const rawChats = data.data || data.message || [];
        // Normalize the chat structure - backend returns nested chat object
        const fetchedChats = rawChats.map((item: any) => ({
          id: item.chat?.id || item.id,
          participant_one_id: item.chat?.participant_one_id || item.participant_one_id,
          participant_two_id: item.chat?.participant_two_id || item.participant_two_id,
          job_id: item.chat?.job_id || item.job_id,
          last_message_at: item.chat?.last_message_at || item.last_message_at,
          other_user: item.other_user,
          last_message: item.last_message,
          unread_count: item.unread_count,
        }));
        setChats(fetchedChats);

        // AFTER fetching chats, check if we need to auto-select
        if (locationState?.autoSelectChatId && !selectedChat) {
          const targetChat = fetchedChats.find((chat: Chat) => chat.id === locationState.autoSelectChatId);
          if (targetChat) {
            setSelectedChat(targetChat);
            navigate(location.pathname, { replace: true, state: {} });
          }
        }
      }
    } catch (error) {
      console.error('❌ [fetchChats] Failed to fetch chats:', error);
      if (showLoading) {
        toast.error('Failed to load chats');
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const createChatWithWorker = async (workerUserId: string) => {
    try {
      
      const response = await fetch('https://verinest.up.railway.app/api/chat/chats', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          other_user_id: workerUserId 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.data) {
          const chatData = data.data;
          // Normalize the chat structure - backend returns nested chat object
          const newChat = {
            id: chatData.chat?.id || chatData.id,
            participant_one_id: chatData.chat?.participant_one_id || chatData.participant_one_id,
            participant_two_id: chatData.chat?.participant_two_id || chatData.participant_two_id,
            job_id: chatData.chat?.job_id || chatData.job_id,
            last_message_at: chatData.chat?.last_message_at || chatData.last_message_at,
            other_user: chatData.other_user,
            last_message: chatData.last_message,
            unread_count: chatData.unread_count,
          };
          setSelectedChat(newChat);
          setChats(prev => [newChat, ...prev]);
          setShowWorkerList(false);
          toast.success(`Chat started with ${newChat.other_user?.name || 'worker'}`);
        } else {
          console.error('❌ [createChatWithWorker] Invalid response structure:', data);
          toast.error('Failed to create chat: Invalid response');
        }
      } else {
        const errorData = await response.json();
        console.error('❌ [createChatWithWorker] API error:', errorData);
        toast.error(errorData.message || 'Failed to start chat');
      }
    } catch (error) {
      console.error('❌ [createChatWithWorker] Network error:', error);
      toast.error('Failed to start chat. Please try again.');
    }
  };

  const fetchMessages = async (chatId: string) => {
    if (!chatId || chatId === 'undefined') {
      console.error('❌ [fetchMessages] Invalid chat ID:', chatId);
      return;
    }

    try {
      const response = await fetch(`https://verinest.up.railway.app/api/chat/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.data || []);
        
        if (data.data && data.data.length > 0) {
          markMessagesAsRead(chatId);
        }
      } else {
        console.error('❌ [fetchMessages] Failed to fetch messages:', response.status);
      }
    } catch (error) {
      console.error('❌ [fetchMessages] Error:', error);
    }
  };

  const markMessagesAsRead = async (chatId: string) => {
    try {
      await fetch(`https://verinest.up.railway.app/api/chat/chats/${chatId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      fetchChats();
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !selectedChat.id) {
      console.error('❌ [sendMessage] Cannot send - missing:', {
        hasMessage: !!newMessage.trim(),
        hasSelectedChat: !!selectedChat,
        hasChatId: selectedChat?.id
      });
      return;
    }

    try {
      const response = await fetch(`https://verinest.up.railway.app/api/chat/chats/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: newMessage,
        }),
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages(selectedChat.id);
        fetchChats();
      } else {
        const errorText = await response.text();
        console.error('❌ [sendMessage] Failed to send message:', response.status, errorText);
        let errorMessage = 'Failed to send message';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Not JSON, use the text as is
          errorMessage = errorText;
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('❌ [sendMessage] Network error:', error);
      toast.error('Failed to send message');
    }
  };

  const handleStartNewChat = () => {
    setShowWorkerList(true);
  };

  const handleSelectWorker = (worker: any) => {
    createChatWithWorker(worker.profile.user_id);
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Chats List */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Messages
              </CardTitle>
              {user?.role === 'employer' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleStartNewChat}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  New Chat
                </Button>
              )}
            </div>
            <CardDescription>
              Your conversations
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {chats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-sm">Start a chat to connect with others</p>
                  {user?.role === 'employer' && (
                    <Button 
                      onClick={handleStartNewChat}
                      className="mt-4"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Find Workers to Chat
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedChat?.id === chat.id 
                          ? 'bg-primary text-primary-foreground shadow-md' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedChat(chat)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {chat.other_user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <h3 className={`font-semibold truncate ${
                              selectedChat?.id === chat.id ? 'text-primary-foreground' : 'text-foreground'
                            }`}>
                              {chat.other_user.name}
                            </h3>
                            {chat.unread_count > 0 && (
                              <Badge 
                                variant={selectedChat?.id === chat.id ? "secondary" : "destructive"}
                                className="h-5 w-5 p-0 flex items-center justify-center text-xs"
                              >
                                {chat.unread_count}
                              </Badge>
                            )}
                          </div>
                          <p className={`text-sm truncate ${
                            selectedChat?.id === chat.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                          }`}>
                            {chat.last_message?.content || 'No messages yet'}
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <span className={`text-xs ${
                              selectedChat?.id === chat.id ? 'text-primary-foreground/60' : 'text-muted-foreground'
                            }`}>
                              @{chat.other_user.username}
                            </span>
                            {chat.last_message && (
                              <span className={`text-xs ${
                                selectedChat?.id === chat.id ? 'text-primary-foreground/60' : 'text-muted-foreground'
                              }`}>
                                {formatMessageTime(chat.last_message.created_at)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Chat Messages OR Worker List */}
      <div className="lg:col-span-2">
        {showWorkerList ? (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Available Workers
              </CardTitle>
              <CardDescription>
                Select a worker to start a conversation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {availableWorkers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No workers available</p>
                    </div>
                  ) : (
                    availableWorkers.map((worker) => (
                      <div
                        key={worker.profile.user_id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleSelectWorker(worker)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {worker.user?.name?.charAt(0).toUpperCase() || 'W'}
                          </div>
                          <div>
                            <h3 className="font-semibold">{worker.user?.name || 'Unknown Worker'}</h3>
                            <p className="text-sm text-muted-foreground capitalize">
                              {worker.profile.category} • {worker.profile.location_city}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Chat
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowWorkerList(false)}
                >
                  Back to Chats
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : selectedChat ? (
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedChat.other_user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <CardTitle>{selectedChat.other_user.name}</CardTitle>
                    <CardDescription>
                      @{selectedChat.other_user.username}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline">
                  Online
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-96 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation</p>
                  </div>
                ) : (
                  // Sort messages by date to ensure proper order
                  [...messages]
                    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    .map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md p-3 rounded-2xl ${
                            message.sender_id === user?.id
                              ? 'bg-primary text-primary-foreground rounded-br-none'
                              : 'bg-muted rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.sender_id === user?.id
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {formatMessageTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                )}
                <div ref={messagesEndRef} />
              </div>
              </ScrollArea>
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={!newMessage.trim()}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full flex flex-col items-center justify-center">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Chat Selected</h3>
              <p className="text-muted-foreground text-center mb-4">
                Select a conversation from the list to start messaging
              </p>
              {user?.role === 'employer' && (
                <Button onClick={handleStartNewChat} className="mb-2">
                  <Users className="h-4 w-4 mr-2" />
                  Start New Chat with Worker
                </Button>
              )}
              <Button onClick={() => fetchChats(true)} variant="outline">
                Refresh Conversations
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};