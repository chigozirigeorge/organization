import { apiClient } from '../utils/api';

interface SearchWorkersParams {
  limit?: number;
  location_state?: string;
  category?: string;
  query?: string;
}

interface CreateChatDto {
  other_user_id: string;
  job_id?: string;
}

interface ContractProposalDto {
  job_id: string;
  terms: string;
  amount: number;
  duration_days?: number;
}

interface ProposalResponseDto {
  status: 'accepted' | 'rejected' | 'negotiated';
  message?: string;
  counter_amount?: number;
}

export async function getChats() {
  const res = await apiClient.get('/chat/chats');
  return res.data || res;
}

export async function createChat(other_user_id: string, job_id?: string) {
  const payload: CreateChatDto = { other_user_id, job_id };
  const res = await apiClient.post('/chat/chats', payload);
  return res.data || res;
}

export async function getChatDetails(chatId: string) {
  const res = await apiClient.get(`/chat/chats/${chatId}`);
  return res.data || res;
}

export async function getMessages(chatId: string, page = 1, limit = 20) {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  const res = await apiClient.get(`/chat/chats/${chatId}/messages?${query.toString()}`);
  return res.data || res;
}

export async function sendMessage(chatId: string, payload: {
  content: string;
  message_type?: 'text' | 'image' | 'file';
  file_url?: string;
}) {
  const res = await apiClient.post(`/chat/chats/${chatId}/messages`, payload);
  return res.data || res;
}

export async function markChatAsRead(chatId: string) {
  const res = await apiClient.put(`/chat/chats/${chatId}/read`);
  return res.data || res;
}

export async function getUnreadCount() {
  const res = await apiClient.get('/chat/unread-count');
  return res.data || res;
}

export async function proposeContractFromChat(chatId: string, proposal: ContractProposalDto) {
  const res = await apiClient.post(`/chat/chats/${chatId}/contract-proposal`, proposal);
  return res.data || res;
}

export async function respondToProposal(proposalId: string, response: ProposalResponseDto) {
  const res = await apiClient.put(`/chat/contract-proposals/${proposalId}/respond`, response);
  return res.data || res;
}

export async function searchWorkers(params: SearchWorkersParams = {}) {
  const query = new URLSearchParams();
  if (params.limit) query.set('limit', String(params.limit));
  if (params.location_state) query.set('location_state', params.location_state);
  if (params.category) query.set('category', params.category);
  if (params.query) query.set('q', params.query);

  const endpoint = `/labour/workers/search?${query.toString()}`;
  const res = await apiClient.get(endpoint);
  return res.data || res;
}

export default {
  getChats,
  createChat,
  getChatDetails,
  getMessages,
  sendMessage,
  markChatAsRead,
  getUnreadCount,
  proposeContractFromChat,
  respondToProposal,
  searchWorkers,
};
