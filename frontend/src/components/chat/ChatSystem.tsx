// ChatSystem.tsx - FULLY FIXED: Endpoints, Scrolling, Loading, Contracts
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { MessageSquare, Send, Users, Plus, ArrowLeft, Search, MapPin, FileText, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import * as chatService from '../../services/chat';
import { getEmployerDashboard, createContractForJob } from '../../services/labour';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { NIGERIAN_STATES } from '@/lib/states';

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

interface Job {
  id: string;
  title: string;
  status: string;
  category: string;
  budget: number;
}

const WORKER_CATEGORIES = [
  'Painter', 'Plumber', 'Electrician', 'Carpenter', 'Mason', 'Tiler', 'Roofer', 'Welder',
  'SteelBender', 'ConcreteWorker', 'Bricklayer', 'FlooringSpecialist', 'Glazier',
  'InteriorDecorator', 'FurnitureMaker', 'Upholsterer', 'CurtainBlindInstaller',
  'WallpaperSpecialist', 'Landscaper', 'Gardener', 'FenceInstaller', 'SwimmingPoolTechnician',
  'OutdoorLightingSpecialist', 'RealEstateAgent', 'PropertyManager', 'FacilityManager',
  'BuildingInspector', 'QuantitySurveyor', 'Architect', 'CivilEngineer', 'StructuralEngineer',
  'Cleaner', 'Handyman', 'HVACTechnician', 'ElevatorTechnician', 'SecuritySystemInstaller',
  'PestControlSpecialist', 'DemolitionExpert', 'SiteSupervisor', 'ConstructionLaborer',
  'SafetyOfficer', 'FireSafetyOfficer', 'Other'
];

type MobileView = 'chat-list' | 'chat-messages' | 'worker-list' | 'contract-form';

export const ChatSystem = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [availableWorkers, setAvailableWorkers] = useState<any[]>([]);
  const [filterState, setFilterState] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const locationState = location.state as LocationState;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const isNearBottomRef = useRef<boolean>(true);
  const lastMessageIdRef = useRef<string>('');
  const messageCacheRef = useRef<Record<string, Message[]>>({});
  const messageSignatureRef = useRef<Record<string, string>>({});
  
  // Jobs state
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [loadingJobs, setLoadingJobs] = useState(false);
  
  // Mobile state management
  const [mobileView, setMobileView] = useState<MobileView>('chat-list');

  // Contract form state
  const [contractFormData, setContractFormData] = useState({
    agreed_rate: '',
    agreed_timeline: '',
    terms: ''
  });

  // Track scroll position
  const handleScroll = (event: any) => {
    const target = event.target;
    if (!target) return;
    
    const { scrollTop, scrollHeight, clientHeight } = target;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    isNearBottomRef.current = distanceFromBottom < 100;
  };

  // Smart scroll - only scroll if user is at bottom or sent message
  const scrollToBottom = (force: boolean = false) => {
    if (force || isNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle mobile view transitions
  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    setMobileView('chat-messages');
    isNearBottomRef.current = true;
  };

  const handleBackToChatList = () => {
    setSelectedChat(null);
    setMobileView('chat-list');
  };

  const handleShowWorkerList = () => {
    setMobileView('worker-list');
  };

  const handleBackFromWorkerList = () => {
    setMobileView('chat-list');
  };

  // FIXED: Fetch employer's jobs using correct endpoint
  const fetchMyJobs = async () => {
    if (user?.role !== 'employer') return;

    setLoadingJobs(true);
    try {
      const res = await getEmployerDashboard();
      const jobs = res.posted_jobs || res.data?.posted_jobs || [];
      const activeJobs = jobs.filter((job: Job) =>
        job.status === 'open' || job.status === 'Open' ||
        job.status === 'in_progress' || job.status === 'InProgress'
      );
      setMyJobs(activeJobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoadingJobs(false);
    }
  };

  // Contract creation functions
  const handleOpenContractFlow = () => {
    if (!selectedChat) return;
    setMobileView('contract-form');
    fetchMyJobs(); // Fetch jobs when opening contract form
    
    // Auto-populate contract terms
    setContractFormData(prev => ({
      ...prev,
      terms: `This contract is between the Employer [${user?.name}] and the Worker [${selectedChat.other_user.name} (@${selectedChat.other_user.username})].

Scope of Work:
To be determined based on mutual agreement.

Payment Terms:
- Total agreed amount: ₦${prev.agreed_rate || '0.00'}
- Payment will be held in escrow and released upon job completion
- Work to be completed within ${prev.agreed_timeline || '0'} days

Responsibilities:
1. Worker agrees to complete the work as described
2. Employer agrees to provide necessary information and access
3. Both parties agree to communicate regularly about progress

Termination:
Either party may terminate this contract with 24 hours notice.

Both parties agree to these terms and conditions.`
    }));
  };

  const handleBackFromContract = () => {
    setMobileView('chat-messages');
  };

  // FIXED: Create contract with proper endpoint
  const handleCreateContract = async () => {
    if (!selectedChat || !contractFormData.agreed_rate || !contractFormData.agreed_timeline) {
      toast.error('Please fill in all required contract fields');
      return;
    }

    try {
      const contractPayload: any = {
        worker_id: selectedChat.other_user.id,
        agreed_rate: parseFloat(contractFormData.agreed_rate),
        agreed_timeline: parseInt(contractFormData.agreed_timeline),
        terms: contractFormData.terms,
      };

      // Add job_id if selected
      if (selectedJobId) {
        contractPayload.job_id = selectedJobId;
        
        // Use job-specific contract endpoint
          try {
            const res = await createContractForJob(selectedJobId, contractPayload);
            if (res) {
              toast.success('Contract created successfully!');
              setMobileView('chat-messages');
              const contractMessage = `I've created a contract for the job for ₦${contractFormData.agreed_rate} to be completed in ${contractFormData.agreed_timeline} days. Please review and accept.`;
              setNewMessage(contractMessage);
              setContractFormData({ agreed_rate: '', agreed_timeline: '', terms: '' });
              setSelectedJobId('');
            } else {
              toast.error('Failed to create contract. Please try again.');
            }
          } catch (err) {
            console.error('Contract creation failed:', err);
            toast.error('Failed to create contract. Please try again.');
          }
      } else {
        toast.error('Please select a job for this contract');
      }
    } catch (error) {
      toast.error('Failed to create contract');
      console.error('Contract creation error:', error);
    }
  };

  const updateContractField = (field: string, value: string) => {
    setContractFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      if ((field === 'agreed_rate' || field === 'agreed_timeline') && selectedChat) {
        newData.terms = `This contract is between the Employer and ${selectedChat.other_user.name} (@${selectedChat.other_user.username}).

Scope of Work:
To be determined based on mutual agreement.

Payment Terms:
- Total agreed amount: ₦${field === 'agreed_rate' ? value : prev.agreed_rate || '0.00'}
- Payment will be held in escrow and released upon job completion
- Work to be completed within ${field === 'agreed_timeline' ? value : prev.agreed_timeline || '0'} days

Responsibilities:
1. Worker agrees to complete the work as described
2. Employer agrees to provide necessary information and access
3. Both parties agree to communicate regularly about progress

Termination:
Either party may terminate this contract with 24 hours notice.

Both parties agree to these terms and conditions.`;
      }
      
      return newData;
    });
  };

  // Only scroll when new messages arrive from current user OR user is at bottom
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // Check if this is a new message
      if (lastMessage.id !== lastMessageIdRef.current) {
        lastMessageIdRef.current = lastMessage.id;
        
        // Auto-scroll if it's own message or user is at bottom
        if (lastMessage.sender_id === user?.id || isNearBottomRef.current) {
          setTimeout(() => scrollToBottom(true), 100);
        }
      }
    }
  }, [messages, user?.id]);

  // Keep input focused and caret position stable when messages (or parent) re-render
  useEffect(() => {
    const el = inputRef.current as unknown as HTMLInputElement | HTMLTextAreaElement | null;
    if (!el) return;
    try {
      // Use a loose any-based access to avoid TS narrowing issues from custom Input wrapper
      const inputAny = el as any;
      const pos = typeof inputAny.selectionStart === 'number' ? (inputAny.selectionStart ?? (inputAny.value?.length ?? 0)) : (inputAny.value?.length ?? 0);
      inputAny.focus?.();
      if (typeof inputAny.setSelectionRange === 'function') {
        inputAny.setSelectionRange(pos, pos);
      }
    } catch (err) {
      // noop
    }
  }, [messages]);

  useEffect(() => {
    if (user?.role === 'employer') {
      fetchAvailableWorkers();
    }
  }, [user, filterState, filterCategory]);

  useEffect(() => {
    if (user) {
      fetchChats(true);
    }
  }, [user, locationState?.autoSelectChatId]);

  useEffect(() => {
    if (locationState?.autoSelectChatId) {
      const chatId = locationState.autoSelectChatId;
      const targetChat = chats.find(chat => chat.id === chatId);
      
      if (targetChat) {
        handleSelectChat(targetChat);
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [chats, locationState, navigate, location.pathname]);

  useEffect(() => {
    if (selectedChat && selectedChat.id) {
      const chatId = selectedChat.id;
      const cachedMessages = messageCacheRef.current[chatId];
      if (cachedMessages && cachedMessages.length > 0) {
        setMessages(cachedMessages);
        lastMessageIdRef.current = cachedMessages[cachedMessages.length - 1]?.id || '';
      }
      isNearBottomRef.current = true;

      fetchMessages(chatId, true);
      
      const interval = setInterval(() => {
        fetchMessages(chatId, false);
        fetchChats(false);
      }, 8000);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [selectedChat]);

  const fetchAvailableWorkers = async () => {
    try {
      const res = await chatService.searchWorkers({
        limit: 50,
        location_state: filterState !== 'all' ? filterState : undefined,
        category: filterCategory !== 'all' ? filterCategory : undefined,
      });
      setAvailableWorkers(res.data || res || []);
    } catch (error) {
      console.error('Failed to fetch workers:', error);
    }
  };

  const fetchChats = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
  const data = await chatService.getChats();
      const rawChats = data.data || data.message || data || [];
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

      if (locationState?.autoSelectChatId && !selectedChat) {
        const targetChat = fetchedChats.find((chat: Chat) => chat.id === locationState.autoSelectChatId);
        if (targetChat) {
          handleSelectChat(targetChat);
          navigate(location.pathname, { replace: true, state: {} });
        }
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error);
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
  const data = await chatService.createChat(workerUserId);
      const chatData = data.data || data;
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
      setMobileView('chat-messages');
      toast.success(`Chat started with ${newChat.other_user?.name || 'worker'}`);
    } catch (error) {
      console.error('Network error:', error);
      toast.error('Failed to start chat. Please try again.');
    }
  };

  const fetchMessages = async (chatId: string, showLoading: boolean = false) => {
    if (!chatId || chatId === 'undefined') {
      return;
    }

    try {
      const container = scrollAreaRef.current;
      const prevScrollTop = container?.scrollTop ?? 0;
      const prevScrollHeight = container?.scrollHeight ?? 0;

      const data = await chatService.getMessages(chatId);
      const newMessages = data.data || data || [];
      const signature = createMessageSignature(newMessages);

      if (messageSignatureRef.current[chatId] !== signature) {
        cacheMessagesForChat(chatId, newMessages);
        setMessages(newMessages);

        setTimeout(() => {
          try {
            const containerAfter = scrollAreaRef.current;
            if (!isNearBottomRef.current && containerAfter) {
              const newScrollHeight = containerAfter.scrollHeight ?? 0;
              const heightDiff = newScrollHeight - (prevScrollHeight ?? 0);
              containerAfter.scrollTop = (prevScrollTop ?? 0) + (heightDiff ?? 0);
            } else {
              scrollToBottom(true);
            }
          } catch (err) {
            scrollToBottom(true);
          }
        }, 50);
      }

      if (newMessages.length > 0 && showLoading) {
        markMessagesAsRead(chatId);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markMessagesAsRead = async (chatId: string) => {
    try {
  await chatService.markChatAsRead(chatId);
      fetchChats(false);
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat?.id || !token) {
      return;
    }

    const chatId = selectedChat.id;
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      chat_id: chatId,
      sender_id: user!.id,
      content: newMessage.trim(),
      message_type: "Text",
      created_at: new Date().toISOString(),
      is_read: false
    };

    setMessages(prev => {
      const next = [...prev, tempMessage];
      cacheMessagesForChat(chatId, next);
      return next;
    });
    setNewMessage('');
    isNearBottomRef.current = true;
    
    setTimeout(() => scrollToBottom(true), 50);

    try {
      const res = await chatService.sendMessage(selectedChat.id, {
        content: tempMessage.content,
        message_type: 'Text',
        metadata: null,
      });
      const responseData = res.data || res;
      setMessages(prev => prev.map(msg => msg.id === tempMessage.id ? responseData : msg));
      fetchChats(false);
    } catch (error) {
      console.error('Network error:', error);
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      setNewMessage(tempMessage.content);
      toast.error('Failed to send message - network error');
    }
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

  const getInitials = (name?: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  const createMessageSignature = (list: Message[]) =>
    JSON.stringify(
      list.map((message) => ({
        id: message.id,
        content: message.content,
        created_at: message.created_at,
      }))
    );

  const cacheMessagesForChat = (chatId: string, list: Message[]) => {
    messageCacheRef.current[chatId] = list;
    messageSignatureRef.current[chatId] = createMessageSignature(list);
  };

  const filteredChats = chats.filter(chat => 
    chat.other_user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.other_user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Chat List View
  const ChatListView = () => (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
            {user?.role === 'employer' && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleShowWorkerList}
                className="rounded-full"
              >
                <Users className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-100 border-0 rounded-full"
            />
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 px-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-500 text-center mb-6">Start chatting with workers to begin</p>
            {user?.role === 'employer' && (
              <Button onClick={handleShowWorkerList} className="rounded-full">
                <Plus className="h-4 w-4 mr-2" />
                Start New Chat
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat)}
                className="flex items-center gap-3 p-4 bg-white hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                    {getInitials(chat.other_user.name)}
                  </div>
                  {chat.unread_count > 0 && (
                    <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full min-w-[20px] h-5 flex items-center justify-center text-xs font-bold px-1">
                      {chat.unread_count}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{chat.other_user.name}</h3>
                    {chat.last_message && (
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatMessageTime(chat.last_message.created_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {chat.last_message && (
                      <p className={`text-sm truncate ${chat.unread_count > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                        {chat.last_message.content || 'No messages yet'}
                      </p>
                    )}
                    {!chat.last_message && (
                      <p className="text-sm text-gray-400 truncate">Start a conversation</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {user?.role === 'employer' && (
        <button
          onClick={handleShowWorkerList}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-50"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}
    </div>
  );

  // Chat Messages View
  const ChatMessagesView = () => (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToChatList}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
              {getInitials(selectedChat?.other_user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 truncate">{selectedChat?.other_user.name}</h2>
              <p className="text-xs text-gray-500 truncate">@{selectedChat?.other_user.username}</p>
            </div>
          </div>

          {user?.role === 'employer' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenContractFlow}
              className="flex-shrink-0"
            >
              <FileText className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div 
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-3"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-gray-500 text-center">No messages yet</p>
            <p className="text-sm text-gray-400 text-center">Start the conversation below</p>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {[...messages]
              .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
              .map((message, index) => {
                const isOwn = message.sender_id === user?.id;
                const sortedMessages = [...messages].sort((a, b) => 
                  new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
                const showDate = index === 0 || 
                  new Date(message.created_at).toDateString() !== new Date(sortedMessages[index - 1].created_at).toDateString();

                return (
                  <div key={message.id}>
                    {showDate && (
                      <div className="flex justify-center my-4">
                        <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                          {new Date(message.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: new Date(message.created_at).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                          })}
                        </span>
                      </div>
                    )}
                    
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          isOwn
                            ? 'bg-blue-500 text-white rounded-br-sm'
                            : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                        }`}
                      >
                        <p className="text-sm break-words">{message.content}</p>
                        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                            {formatMessageTime(message.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="bg-white border-t p-3">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              ref={inputRef as any}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            size="icon"
            className="rounded-full h-10 w-10 flex-shrink-0 bg-blue-500 hover:bg-blue-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  // Contract Form View
  const ContractFormView = () => (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackFromContract}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Create Contract</h1>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
            <h3 className="font-semibold mb-2 text-blue-900">Contract with {selectedChat?.other_user.name}</h3>
            <p className="text-sm text-blue-800">
              Create a formal agreement for your work together
            </p>
          </div>

          {/* Job Selection */}
          <div className="space-y-2">
            <Label htmlFor="job_id" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Select Job <span className="text-red-500">*</span>
            </Label>
            {loadingJobs ? (
              <div className="flex items-center justify-center py-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              </div>
            ) : myJobs.length > 0 ? (
              <>
                <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a job for this contract" />
                  </SelectTrigger>
                  <SelectContent>
                    {myJobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{job.title}</span>
                          <span className="text-xs text-gray-500 capitalize">
                            {job.category} • ₦{job.budget?.toLocaleString()}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Select the job posting you want to create a contract for
                </p>
              </>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  No active jobs found. Please create a job posting first.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agreed_rate">Agreed Rate (₦) <span className="text-red-500">*</span></Label>
              <Input
                id="agreed_rate"
                type="number"
                placeholder="0.00"
                value={contractFormData.agreed_rate}
                onChange={(e) => updateContractField('agreed_rate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agreed_timeline">Timeline (Days) <span className="text-red-500">*</span></Label>
              <Input
                id="agreed_timeline"
                type="number"
                placeholder="7"
                value={contractFormData.agreed_timeline}
                onChange={(e) => updateContractField('agreed_timeline', e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="terms">Contract Terms <span className="text-red-500">*</span></Label>
            <Textarea
              id="terms"
              placeholder="Describe the work scope, payment terms, and other conditions..."
              value={contractFormData.terms}
              onChange={(e) => updateContractField('terms', e.target.value)}
              rows={8}
              className="resize-none"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">How it works</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Contract will be sent to the worker for acceptance</li>
              <li>• Payments are held securely in escrow</li>
              <li>• Funds released only when work is completed</li>
              <li>• Both parties are protected by our terms</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4 pb-6">
            <Button 
              onClick={handleCreateContract}
              disabled={!contractFormData.agreed_rate || !contractFormData.agreed_timeline || !selectedJobId}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
            >
              <FileText className="h-4 w-4 mr-2" />
              Create Contract
            </Button>
            <Button 
              variant="outline" 
              onClick={handleBackFromContract}
            >
              Cancel
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );

  // Worker List View
  const WorkerListView = () => (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackFromWorkerList}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900">New Chat</h1>
        </div>

        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <Select value={filterState} onValueChange={setFilterState}>
              <SelectTrigger className="h-9 bg-gray-100 border-0">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {NIGERIAN_STATES.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="h-9 bg-gray-100 border-0">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {WORKER_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {availableWorkers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <Users className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-gray-500">No workers found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y">
            {availableWorkers.map((worker) => (
              <div
                key={worker.profile.user_id}
                onClick={() => handleSelectWorker(worker)}
                className="flex items-center gap-3 p-4 bg-white hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {getInitials(worker.user?.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {worker.user?.name || 'Unknown Worker'}
                  </h3>
                  <p className="text-sm text-gray-600 capitalize truncate">
                    {worker.profile.category}
                  </p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    {worker.profile.location_state}
                  </Badge>
                </div>
                <MessageSquare className="h-5 w-5 text-gray-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] max-h-[600px] overflow-hidden bg-white rounded-lg shadow-sm">
      {mobileView === 'chat-list' && <ChatListView />}
      {mobileView === 'chat-messages' && <ChatMessagesView />}
      {mobileView === 'worker-list' && <WorkerListView />}
      {mobileView === 'contract-form' && <ContractFormView />}
    </div>
  );
};