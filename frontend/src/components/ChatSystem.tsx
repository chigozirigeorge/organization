// ChatSystem.tsx - ENHANCED VERSION WITH CONTRACT CREATION
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { MessageSquare, Send, Users, Search, Plus, User, FileText, MapPin, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { NIGERIAN_STATES, getLGAsForState } from '@/lib/states';

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

interface CreateContractData {
  job_id?: string;
  worker_id: string;
  agreed_rate: number;
  agreed_timeline: number;
  terms: string;
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

interface JobFormData {
  category: string;
  title: string;
  description: string;
  location_state: string;
  location_city: string;
  location_address: string;
  budget: string;
  estimated_duration_days: string;
  partial_payment_allowed: boolean;
  partial_payment_percentage: string,
}

const WORKER_CATEGORIES = [
  'Painter',
  'Plumber',
  'Electrician',
  'Carpenter',
  'Mason',
  'Tiler',
  'Roofer',
  'Welder',
  'SteelBender',
  'ConcreteWorker',
  'Bricklayer',
  'FlooringSpecialist',
  'Glazier',
  'InteriorDecorator',
  'FurnitureMaker',
  'Upholsterer',
  'CurtainBlindInstaller',
  'WallpaperSpecialist',
  'Landscaper',
  'Gardener',
  'FenceInstaller',
  'SwimmingPoolTechnician',
  'OutdoorLightingSpecialist',
  'RealEstateAgent',
  'PropertyManager',
  'FacilityManager',
  'BuildingInspector',
  'QuantitySurveyor',
  'Architect',
  'CivilEngineer',
  'StructuralEngineer',
  'Cleaner',
  'Handyman',
  'HVACTechnician',
  'ElevatorTechnician',
  'SecuritySystemInstaller',
  'PestControlSpecialist',
  'DemolitionExpert',
  'SiteSupervisor',
  'ConstructionLaborer',
  'SafetyOfficer',
  'FireSafetyOfficer',
  'Other'
];

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
  const [filterState, setFilterState] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const locationState = location.state as LocationState;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showContractForm, setShowContractForm] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [creatingContract, setCreatingContract] = useState(false);

  const [jobFormData, setJobFormData] = useState<JobFormData>({
    category: '',
    title: '',
    description: '',
    location_state: '',
    location_city: '',
    location_address: '',
    budget: '',
    estimated_duration_days: '7',
    partial_payment_allowed: false,
    partial_payment_percentage: '40',
  });

  const [contractFormData, setContractFormData] = useState({
    agreed_rate: '',
    agreed_timeline: '',
    terms: ''
  });

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
  }, [user, filterState, filterCategory]);

  // Fetch chats on mount and when locationState changes
  useEffect(() => {
    if (user) {
      fetchChats(true);
    }
  }, [user, locationState?.autoSelectChatId]);

  useEffect(() => {
    // Handle auto-selection from navigation
    if (locationState?.autoSelectChatId) {
      const chatId = locationState.autoSelectChatId;
      const targetChat = chats.find(chat => chat.id === chatId);
      
      if (targetChat) {
        setSelectedChat(targetChat);
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [chats, locationState, navigate, location.pathname]);

  useEffect(() => {
    if (selectedChat && selectedChat.id) {
      const chatId = selectedChat.id;
      fetchMessages(chatId);
      const interval = setInterval(() => {
        fetchMessages(chatId);
        fetchChats();
      }, 8000);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [selectedChat]);

  const fetchAvailableWorkers = async () => {
    try {
      let url = 'https://verinest.up.railway.app/api/labour/workers/search?limit=50';
      
      // Only add state filter if not "all"
      if (filterState && filterState !== 'all') {
        url += `&location_state=${encodeURIComponent(filterState)}`;
      }
      
      // Only add category filter if not "all"
      if (filterCategory && filterCategory !== 'all') {
        url += `&category=${encodeURIComponent(filterCategory)}`;
      }

      const response = await fetch(url, {
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
        const rawChats = data.data || data.message || [];
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
            setSelectedChat(targetChat);
            navigate(location.pathname, { replace: true, state: {} });
          }
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
          toast.error('Failed to create chat: Invalid response');
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to start chat');
      }
    } catch (error) {
      console.error('Network error:', error);
      toast.error('Failed to start chat. Please try again.');
    }
  };

  const fetchMessages = async (chatId: string) => {
    if (!chatId || chatId === 'undefined') {
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
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
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
        let errorMessage = 'Failed to send message';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {}
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Network error:', error);
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

//   // In ChatSystem.tsx - Enhanced handleCreateJobAndContract function

// const handleCreateJobAndContract = async () => {
//   if (!selectedChat) return;

//   setCreatingContract(true);
//   try {
//     let jobId;
//     let existingJob = null;

//     // Step 1: Fetch user's existing jobs first
//     try {
//       console.log('🔍 Fetching existing jobs for user...');
//       const jobsResponse = await fetch('https://verinest.up.railway.app/api/labour/employer/dashboard', {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       });

//       if (jobsResponse.ok) {
//         const dashboardData = await jobsResponse.json();
//         const existingJobs = dashboardData.data?.posted_jobs || [];
        
//         console.log('📋 Found existing jobs:', existingJobs.length);
        
//         // Look for a job with similar title that's still open
//         existingJob = existingJobs.find((job: any) => 
//           job.title?.includes(selectedChat.other_user.name) && 
//           job.status === 'Open'
//         );

//         if (existingJob) {
//           jobId = existingJob.id;
//           console.log('✅ Found existing job to use:', jobId, existingJob.title);
//         } else {
//           console.log('📝 No suitable existing job found, will create new one');
//         }
//       }
//     } catch (error) {
//       console.log('❌ Could not fetch existing jobs, will create new one:', error);
//     }

//     // Step 2: Create new job only if no suitable existing job found
//     if (!jobId) {
//       console.log('🚀 Creating new job...');
//       const jobResponse = await fetch('https://verinest.up.railway.app/api/labour/jobs', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           category: jobFormData.category || 'Other',
//           title: jobFormData.title || `Work with ${selectedChat.other_user.name}`,
//           description: jobFormData.description || `Direct work agreement with ${selectedChat.other_user.name} through chat.`,
//           location_state: jobFormData.location_state || 'Lagos',
//           location_city: jobFormData.location_city || 'Lagos', 
//           location_address: jobFormData.location_address || 'To be determined',
//           budget: parseFloat(contractFormData.agreed_rate) || parseFloat(jobFormData.budget) || 1000,
//           estimated_duration_days: parseInt(contractFormData.agreed_timeline) || parseInt(jobFormData.estimated_duration_days) || 7,
//           partial_payment_allowed: false
//         }),
//       });

//       // Handle job creation response - the job might be created even with notification errors
//       const responseText = await jobResponse.text();
//       console.log('📨 Job creation response:', responseText);

//       if (jobResponse.ok) {
//         try {
//           const jobData = JSON.parse(responseText);
//           jobId = jobData.data?.id;
//           console.log('✅ New job created successfully:', jobId);
//         } catch (parseError) {
//           console.error('❌ Failed to parse job creation response:', parseError);
//           // Even if parsing fails, try to extract job ID from response text
//           const match = responseText.match(/"id":"([^"]+)"/);
//           if (match) {
//             jobId = match[1];
//             console.log('🔄 Extracted job ID from response text:', jobId);
//           }
//         }
//       } else {
//         // Job creation failed, but check if it's just the notification error
//         if (responseText.includes('notifications') && responseText.includes('title')) {
//           console.log('⚠️ Job creation had notification error, but job might be created');
//           // Try to extract job ID anyway
//           const match = responseText.match(/"id":"([^"]+)"/);
//           if (match) {
//             jobId = match[1];
//             console.log('🔄 Extracted job ID despite notification error:', jobId);
//           } else {
//             throw new Error('Job creation failed with notification error and no job ID found');
//           }
//         } else {
//           throw new Error(`Job creation failed: ${responseText}`);
//         }
//       }

//       if (!jobId) {
//         throw new Error('Job ID not found after creation attempt');
//       }
//     }

//     // Step 3: Get worker profile ID
//     let workerProfileId;
//     try {
//       console.log('👤 Fetching worker profile...');
//       const workerProfileResponse = await fetch(`https://verinest.up.railway.app/api/labour/workers/${selectedChat.other_user.id}`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       });

//       if (workerProfileResponse.ok) {
//         const workerProfileData = await workerProfileResponse.json();
//         workerProfileId = workerProfileData.data?.profile?.id;
//         console.log('✅ Worker profile ID:', workerProfileId);
//       } else {
//         console.log('⚠️ Could not fetch worker profile, using user ID as fallback');
//         workerProfileId = selectedChat.other_user.id;
//       }
//     } catch (error) {
//       console.log('⚠️ Error fetching worker profile, using user ID:', error);
//       workerProfileId = selectedChat.other_user.id;
//     }

//     if (!workerProfileId) {
//       workerProfileId = selectedChat.other_user.id;
//     }

//     console.log('🔍 Final worker ID to use:', workerProfileId);

//     // Step 4: Try to assign worker to job
//     console.log('🤝 Assigning worker to job...');
//     const assignResponse = await fetch(`https://verinest.up.railway.app/api/labour/jobs/${jobId}/assign`, {
//       method: 'PUT',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         worker_id: workerProfileId,
//       }),
//     });

//     if (assignResponse.ok) {
//       const assignData = await assignResponse.json();
//       console.log('✅ Worker assigned successfully:', assignData);
//       toast.success('Contract created successfully! Worker assigned to job.');
      
//       // Success - reset and navigate
//       setShowJobForm(false);
//       setShowContractForm(false);
//       setJobFormData({
//         category: '',
//         title: '',
//         description: '',
//         location_state: '',
//         location_city: '',
//         location_address: '',
//         budget: '',
//         estimated_duration_days: '7',
//         partial_payment_allowed: false,
//         partial_payment_percentage: '40'
//       });
//       setContractFormData({
//         agreed_rate: '',
//         agreed_timeline: '',
//         terms: ''
//       });
      
//       navigate('/dashboard/contracts');
//       return;
//     } else {
//       const errorText = await assignResponse.text();
//       console.error('❌ Worker assignment failed:', errorText);
      
//       let errorMessage = 'Failed to assign worker to job';
//       try {
//         const errorData = JSON.parse(errorText);
//         errorMessage = errorData.message || errorMessage;
//       } catch (e) {
//         errorMessage = errorText;
//       }
      
//       // If assignment fails because worker hasn't applied
//       if (errorMessage.includes('has not applied') || errorMessage.includes('not applied')) {
//         throw new Error('Worker needs to apply to the job first. Please ask the worker to apply through the job listing.');
//       }
      
//       throw new Error(errorMessage);
//     }

//   } catch (error: any) {
//     console.error('❌ Failed to create job and assign worker:', error);
    
//     // More specific error handling
//     if (error.message.includes('Worker needs to apply')) {
//       toast.error('Worker Application Required: Please ask the worker to apply to the job first, then you can assign them.');
//     } else if (error.message.includes('notifications') || error.message.includes('notification')) {
//       toast.warning('Job was created but there was a notification issue. The contract might still be created. Please check your contracts list.');
//       navigate('/dashboard/contracts');
//     } else if (error.message.includes('validation') || error.message.includes('Validation')) {
//       toast.error('Validation Error: Please check all job details are correct.');
//     } else {
//       toast.error(error.message || 'Failed to create job and assign worker');
//     }
//   } finally {
//     setCreatingContract(false);
//   }
// };

// // Add this function to pre-fill from existing jobs
// const handleSelectExistingJob = async () => {
//   if (!selectedChat) return;

//   try {
//     console.log('🔍 Fetching existing jobs for selection...');
//     const jobsResponse = await fetch('https://verinest.up.railway.app/api/labour/employer/dashboard', {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//     });

//     if (jobsResponse.ok) {
//       const dashboardData = await jobsResponse.json();
//       const existingJobs = dashboardData.data?.posted_jobs || [];
      
//       if (existingJobs.length > 0) {
//         // For now, auto-select the first open job that matches the worker's category
//         const suitableJob = existingJobs.find((job: any) => 
//           job.status === 'Open'
//         );

//         if (suitableJob) {
//           // Pre-fill the job form with existing job data
//           setJobFormData({
//             category: suitableJob.category || '',
//             title: suitableJob.title || `Work with ${selectedChat.other_user.name}`,
//             description: suitableJob.description || '',
//             location_state: suitableJob.location_state || '',
//             location_city: suitableJob.location_city || '',
//             location_address: suitableJob.location_address || '',
//             budget: suitableJob.budget?.toString() || contractFormData.agreed_rate || '',
//             estimated_duration_days: suitableJob.estimated_duration_days?.toString() || '7',
//             partial_payment_allowed: suitableJob.partial_payment_allowed || false,
//             partial_payment_percentage: suitableJob.partial_payment_percentage?.toString() || '40'
//           });
          
//           console.log('✅ Pre-filled with existing job:', suitableJob.title);
//           setShowJobForm(true);
//         } else {
//           // No suitable existing jobs, create new one
//           handleOpenContractFlow();
//         }
//       } else {
//         // No existing jobs, create new one
//         handleOpenContractFlow();
//       }
//     }
//   } catch (error) {
//     console.error('Error fetching existing jobs:', error);
//     // Fallback to creating new job
//     handleOpenContractFlow();
//   }
// };

// Add this function to pre-fill from existing jobs
const handleSelectExistingJob = async () => {
  if (!selectedChat) return;

  try {
    console.log('🔍 Fetching existing jobs for selection...');
    const jobsResponse = await fetch('https://verinest.up.railway.app/api/labour/employer/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (jobsResponse.ok) {
      const dashboardData = await jobsResponse.json();
      const existingJobs = dashboardData.data?.posted_jobs || [];
      
      if (existingJobs.length > 0) {
        // For now, auto-select the first open job that matches the worker's category
        const suitableJob = existingJobs.find((job: any) => 
          job.status === 'Open'
        );

        if (suitableJob) {
          // Pre-fill the job form with existing job data
          setJobFormData({
            category: suitableJob.category || '',
            title: suitableJob.title || `Work with ${selectedChat.other_user.name}`,
            description: suitableJob.description || '',
            location_state: suitableJob.location_state || '',
            location_city: suitableJob.location_city || '',
            location_address: suitableJob.location_address || '',
            budget: suitableJob.budget?.toString() || contractFormData.agreed_rate || '',
            estimated_duration_days: suitableJob.estimated_duration_days?.toString() || '7',
            partial_payment_allowed: suitableJob.partial_payment_allowed || false,
            partial_payment_percentage: suitableJob.partial_payment_percentage?.toString() || '40'
          });
          
          console.log('✅ Pre-filled with existing job:', suitableJob.title);
          setShowJobForm(true);
        } else {
          // No suitable existing jobs, create new one
          handleOpenContractFlow();
        }
      } else {
        // No existing jobs, create new one
        handleOpenContractFlow();
      }
    }
  } catch (error) {
    console.error('Error fetching existing jobs:', error);
    // Fallback to creating new job
    handleOpenContractFlow();
  }
};


// Update the handleOpenContractFlow to use existing jobs
const handleOpenContractFlow = () => {
  if (!selectedChat) return;
  
  // First try to use existing jobs, fallback to creating new one
  handleSelectExistingJob();
};

// In ChatSystem.tsx - Fixed handleCreateJobAndContract function

// In ChatSystem.tsx - Fixed handleCreateJobAndContract function

const handleCreateJobAndContract = async () => {
  if (!selectedChat) return;

  setCreatingContract(true);
  try {
    let jobId;
    let existingJob = null;

    // Step 1: Fetch existing jobs or create new one
    try {
      console.log('🔍 Fetching existing jobs for user...');
      const jobsResponse = await fetch('https://verinest.up.railway.app/api/labour/employer/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (jobsResponse.ok) {
        const dashboardData = await jobsResponse.json();
        const existingJobs = dashboardData.data?.posted_jobs || [];
        
        console.log('📋 Found existing jobs:', existingJobs.length);
        
        // Look for a job with similar title that's still open
        existingJob = existingJobs.find((job: any) => 
          job.title?.includes(selectedChat.other_user.name) && 
          job.status === 'Open'
        );

        if (existingJob) {
          jobId = existingJob.id;
          console.log('✅ Found existing job to use:', jobId, existingJob.title);
        } else {
          console.log('📝 No suitable existing job found, will create new one');
        }
      }
    } catch (error) {
      console.log('❌ Could not fetch existing jobs, will create new one:', error);
    }

    // Step 2: Create new job only if no suitable existing job found
    if (!jobId) {
      console.log('🚀 Creating new job...');
      const jobResponse = await fetch('https://verinest.up.railway.app/api/labour/jobs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: jobFormData.category || 'Other',
          title: jobFormData.title || `Work with ${selectedChat.other_user.name}`,
          description: jobFormData.description || `Direct work agreement with ${selectedChat.other_user.name} through chat.`,
          location_state: jobFormData.location_state || 'Lagos',
          location_city: jobFormData.location_city || 'Lagos', 
          location_address: jobFormData.location_address || 'To be determined',
          budget: parseFloat(contractFormData.agreed_rate) || parseFloat(jobFormData.budget) || 1000,
          estimated_duration_days: parseInt(contractFormData.agreed_timeline) || parseInt(jobFormData.estimated_duration_days) || 7,
          partial_payment_allowed: false
        }),
      });

      // Handle job creation response
      const responseText = await jobResponse.text();
      console.log('📨 Job creation response:', responseText);

      if (jobResponse.ok) {
        try {
          const jobData = JSON.parse(responseText);
          jobId = jobData.data?.id;
          console.log('✅ New job created successfully:', jobId);
        } catch (parseError) {
          console.error('❌ Failed to parse job creation response:', parseError);
          const match = responseText.match(/"id":"([^"]+)"/);
          if (match) {
            jobId = match[1];
            console.log('🔄 Extracted job ID from response text:', jobId);
          }
        }
      } else {
        if (responseText.includes('notifications') && responseText.includes('title')) {
          console.log('⚠️ Job creation had notification error, but job might be created');
          const match = responseText.match(/"id":"([^"]+)"/);
          if (match) {
            jobId = match[1];
            console.log('🔄 Extracted job ID despite notification error:', jobId);
          } else {
            throw new Error('Job creation failed with notification error and no job ID found');
          }
        } else {
          throw new Error(`Job creation failed: ${responseText}`);
        }
      }

      if (!jobId) {
        throw new Error('Job ID not found after creation attempt');
      }
    }

    // Step 3: Check if worker has already applied to this job
    console.log('🔍 Checking if worker has applied to job...');
    let workerHasApplied = false;
    let workerApplication = null;
    
    try {
      const applicationsResponse = await fetch(`https://verinest.up.railway.app/api/labour/jobs/${jobId}/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json();
        workerApplication = applicationsData.data?.find((app: any) => 
          app.worker_user_id === selectedChat.other_user.id
        );

        if (workerApplication) {
          workerHasApplied = true;
          console.log('✅ Worker has applied to this job:', workerApplication);
        } else {
          console.log('❌ Worker has NOT applied to this job yet');
        }
      }
    } catch (error) {
      console.log('⚠️ Error checking applications:', error);
    }

    // Step 4: If worker hasn't applied, send them the job link
    if (!workerHasApplied) {
      console.log('💬 Sending job link to worker...');
      const jobLink = `${window.location.origin}/dashboard/jobs/${jobId}`;
      
      const messageToWorker = `Hi! I'd like to work with you. Please apply to this job so we can start our contract: ${jobLink}\n\nOnce you apply, I'll be able to assign you immediately and we can begin the work.`;
      
      try {
        await fetch(`https://verinest.up.railway.app/api/chat/chats/${selectedChat.id}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            content: messageToWorker,
          }),
        });
        console.log('✅ Message sent to worker with job link');
      } catch (messageError) {
        console.error('❌ Failed to send message to worker:', messageError);
      }

      toast.success(
        <div className="space-y-2">
          <p className="font-semibold">Job Ready!</p>
          <p>I've sent the job link to the worker. They need to apply first.</p>
          <p className="text-sm">Once they apply, come back here to create the contract.</p>
          <Button 
            size="sm" 
            onClick={() => navigate(`/dashboard/jobs/${jobId}`)}
            className="mt-2"
          >
            View Job & Applications
          </Button>
        </div>,
        { duration: 8000 }
      );

      setShowJobForm(false);
      setShowContractForm(false);
      resetForms();
      return;
    }

    // Step 5: Worker HAS applied - now assign them using their USER ID (not profile ID)
    console.log('🤝 Worker has applied - attempting assignment...');
    
    // Use the worker's USER ID (from the chat), not their profile ID
    const workerUserId = selectedChat.other_user.id;
    console.log('🔍 Using worker USER ID for assignment:', workerUserId);

    const assignResponse = await fetch(`https://verinest.up.railway.app/api/labour/jobs/${jobId}/assign`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        worker_id: workerApplication.worker_id, // Use USER ID, not profile ID
      }),
    });

    if (assignResponse.ok) {
      const assignData = await assignResponse.json();
      console.log('✅ Worker assigned successfully:', assignData);
      toast.success('Contract created successfully! Worker assigned to job.');
      
      // Success - reset and navigate
      setShowJobForm(false);
      setShowContractForm(false);
      resetForms();
      navigate('/dashboard/contracts');
      return;
    } else {
      const errorText = await assignResponse.text();
      console.error('❌ Assignment failed:', errorText);
      
      let errorMessage = 'Failed to assign worker to job';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        errorMessage = errorText;
      }
      
      throw new Error(errorMessage);
    }

  } catch (error: any) {
    console.error('❌ Failed in contract creation process:', error);
    
    if (error.message.includes('foreign key constraint') || error.message.includes('assigned_worker_id_fkey')) {
      toast.error('Assignment Error: There seems to be a database issue. Please try assigning the worker through the job applications page directly.');
      navigate('/dashboard/my-jobs');
    } else if (error.message.includes('notifications') || error.message.includes('notification')) {
      toast.warning('Job was created but there was a notification issue. Please check your jobs list.');
    } else {
      toast.error(error.message || 'Failed to create contract');
    }
  } finally {
    setCreatingContract(false);
  }
};

// Helper function to reset forms
const resetForms = () => {
  setJobFormData({
    category: '',
    title: '',
    description: '',
    location_state: '',
    location_city: '',
    location_address: '',
    budget: '',
    estimated_duration_days: '7',
    partial_payment_allowed: false,
    partial_payment_percentage: '40'
  });
  setContractFormData({
    agreed_rate: '',
    agreed_timeline: '',
    terms: ''
  });
};

// Add this function to check for applications periodically
const startApplicationMonitoring = (jobId: string, workerId: string) => {
  const monitorInterval = setInterval(async () => {
    try {
      const hasApplied = await checkIfWorkerApplied(jobId, workerId);
      if (hasApplied) {
        clearInterval(monitorInterval);
        toast.success('Worker has applied! You can now assign them.');
        // You could auto-assign here or just notify the employer
      }
    } catch (error) {
      console.log('Monitoring error:', error);
    }
  }, 10000); // Check every 10 seconds

  // Stop monitoring after 10 minutes
  setTimeout(() => {
    clearInterval(monitorInterval);
  }, 600000);
};

const checkIfWorkerApplied = async (jobId: string, workerUserId: string) => {
  try {
    const applicationsResponse = await fetch(`https://verinest.up.railway.app/api/labour/jobs/${jobId}/applications`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (applicationsResponse.ok) {
      const applicationsData = await applicationsResponse.json();
      const workerApplication = applicationsData.data?.find((app: any) => 
        app.worker_user_id === workerUserId
      );
      return !!workerApplication;
    }
    return false;
  } catch (error) {
    console.error('Error checking applications:', error);
    return false;
  }
};

  const updateJobFormField = (field: string, value: any) => {
    setJobFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateContractField = (field: string, value: string) => {
    setContractFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-update terms template when rate or timeline changes
      if (field === 'agreed_rate' || field === 'agreed_timeline') {
        newData.terms = `This contract is between the Employer and ${selectedChat?.other_user.name} (@${selectedChat?.other_user.username}).

      Scope of Work:
      To be determined based on mutual agreement.

      Payment Terms:
      - Total agreed amount: ₦${newData.agreed_rate || '0.00'}
      - Payment will be held in escrow and released upon job completion
      - Work to be completed within ${newData.agreed_timeline || '0'} days

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

  // Job Form Component
  const renderJobForm = () => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Create Job for Contract
        </CardTitle>
        <CardDescription>
          First, create a job that will be associated with this contract
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Work Category</Label>
            <Select
              value={jobFormData.category}
              onValueChange={(value) => updateJobFormField('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {WORKER_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              placeholder="e.g., Home Cleaning Service"
              value={jobFormData.title}
              onChange={(e) => updateJobFormField('title', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Job Description</Label>
          <Textarea
            id="description"
            placeholder="Describe the work to be done..."
            value={jobFormData.description}
            onChange={(e) => updateJobFormField('description', e.target.value)}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location_state">State</Label>
            <Select
              value={jobFormData.location_state}
              onValueChange={(value) => updateJobFormField('location_state', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {NIGERIAN_STATES.map(state => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_city">LGA/City</Label>
            <Select
              value={jobFormData.location_city}
              onValueChange={(value) => updateJobFormField('location_city', value)}
              disabled={!jobFormData.location_state}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select LGA" />
              </SelectTrigger>
              <SelectContent>
                {getLGAsForState(jobFormData.location_state).map(lga => (
                  <SelectItem key={lga} value={lga}>
                    {lga}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_address">Address</Label>
            <Input
              id="location_address"
              placeholder="Street address"
              value={jobFormData.location_address}
              onChange={(e) => updateJobFormField('location_address', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="budget">Budget (₦)</Label>
            <Input
              id="budget"
              type="number"
              placeholder="0.00"
              value={jobFormData.budget}
              onChange={(e) => updateJobFormField('budget', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated_duration_days">Timeline (Days)</Label>
            <Input
              id="estimated_duration_days"
              type="number"
              placeholder="7"
              value={jobFormData.estimated_duration_days}
              onChange={(e) => updateJobFormField('estimated_duration_days', e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button 
            onClick={() => setShowContractForm(true)}
            disabled={!jobFormData.category || !jobFormData.title || !jobFormData.budget}
            className="flex-1"
          >
            Continue to Contract
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowJobForm(false)}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Contract Form Component
  const renderContractForm = () => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Create Contract with {selectedChat?.other_user.name}
        </CardTitle>
        <CardDescription>
          Finalize the contract terms and create the agreement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="agreed_rate">Agreed Rate (₦)</Label>
            <Input
              id="agreed_rate"
              type="number"
              placeholder="0.00"
              value={contractFormData.agreed_rate}
              onChange={(e) => updateContractField('agreed_rate', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="agreed_timeline">Timeline (Days)</Label>
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
          <Label htmlFor="terms">Contract Terms</Label>
          <Textarea
            id="terms"
            placeholder="Describe the work scope, payment terms, and other conditions..."
            value={contractFormData.terms}
            onChange={(e) => updateContractField('terms', e.target.value)}
            rows={6}
          />
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Job Details</h4>
          <div className="text-sm space-y-1">
            <p><strong>Title:</strong> {jobFormData.title}</p>
            <p><strong>Category:</strong> {jobFormData.category}</p>
            <p><strong>Location:</strong> {jobFormData.location_city}, {jobFormData.location_state}</p>
            <p><strong>Budget:</strong> ₦{parseFloat(jobFormData.budget || '0').toLocaleString()}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={handleCreateJobAndContract}
            disabled={creatingContract || !contractFormData.agreed_rate || !contractFormData.agreed_timeline}
            className="flex-1"
          >
            {creatingContract ? (
              <>Creating Contract...</>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Create Job & Contract
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowContractForm(false)}
          >
            Back
          </Button>
        </div>
      </CardContent>
    </Card>
  );

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

      {/* Chat Messages OR Worker List OR Forms */}
      <div className="lg:col-span-2">
        {showJobForm ? (
          showContractForm ? renderContractForm() : renderJobForm()
        ) : showWorkerList ? (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Available Workers
              </CardTitle>
              <CardDescription>
                Find and connect with skilled workers
              </CardDescription>
              
              {/* Filters - FIXED VERSION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="filter-state">Filter by State</Label>
                  <Select value={filterState} onValueChange={setFilterState}>
                    <SelectTrigger>
                      <SelectValue placeholder="All states" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States</SelectItem>
                      {NIGERIAN_STATES.map(state => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filter-category">Filter by Category</Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {WORKER_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {availableWorkers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No workers found</p>
                      <p className="text-sm">Try adjusting your filters</p>
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
                              {worker.profile.category} • {worker.profile.location_city}, {worker.profile.location_state}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                <MapPin className="h-3 w-3 mr-1" />
                                {worker.profile.location_state}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {worker.profile.experience_years} yrs exp
                              </Badge>
                            </div>
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
        ) :  selectedChat ? (
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
                <div className="flex items-center gap-2">
                  {/* Add contract button for employers */}
                  {user?.role === 'employer' && (
                    <Button 
                      onClick={handleOpenContractFlow}
                      className="gap-1"
                    >
                      <FileText className="h-4 w-4" />
                      Create Contract
                    </Button>
                  )}
                  <Badge variant="outline">
                    Online
                  </Badge>
                </div>
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