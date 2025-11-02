import { api } from './api';

export interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  participant1: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
    role: string;
  };
  participant2: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
    role: string;
  };
  carId?: string;
  car?: {
    id: string;
    brand: string;
    model: string;
    year: number;
    primaryImage?: string;
    salePrice?: number;
    rentalPrice?: number;
    isForRent: boolean;
    isForSale: boolean;
  };
  lastMessageAt?: string;
  lastMessage?: string;
  _count?: {
    messages: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  content: string;
  imageUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationRequest {
  otherUserId: string;
  carId?: string;
  rentalId?: string;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  imageUrl?: string;
}

export const chatApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query<{ conversations: Conversation[] }, void>({
      query: () => '/chat/conversations',
      providesTags: ['Conversations'],
    }),
    getConversation: builder.query<{ conversation: Conversation }, string>({
      query: (conversationId) => `/chat/conversations/${conversationId}`,
      providesTags: (_result, _error, conversationId) => [
        { type: 'Conversation', id: conversationId },
      ],
    }),
    createConversation: builder.mutation<
      { conversation: Conversation },
      CreateConversationRequest
    >({
      query: (body) => ({
        url: '/chat/conversations',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Conversations'],
    }),
    getMessages: builder.query<
      { messages: Message[] },
      { conversationId: string; limit?: number; before?: string }
    >({
      query: ({ conversationId, limit, before }) => {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (before) params.append('before', before);
        return `/chat/conversations/${conversationId}/messages?${params.toString()}`;
      },
      providesTags: (_result, _error, { conversationId }) => [
        { type: 'Messages', id: conversationId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetConversationsQuery,
  useGetConversationQuery,
  useCreateConversationMutation,
  useGetMessagesQuery,
} = chatApi;

