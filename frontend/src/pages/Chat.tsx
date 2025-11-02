import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useGetConversationsQuery, useGetConversationQuery, Conversation } from '../services/chatApi';
import { useAppSelector } from '../hooks/redux';
import Navbar from '../components/layout/Navbar';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import { MessageCircle } from 'lucide-react';

const Chat = () => {
  const { user } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const conversationIdFromState = (location.state as { conversationId?: string })?.conversationId;
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const { data, isLoading } = useGetConversationsQuery();
  const { data: conversationData } = useGetConversationQuery(conversationIdFromState || '', {
    skip: !conversationIdFromState,
  });

  // Set selected conversation from navigation state
  useEffect(() => {
    if (conversationIdFromState && conversationData?.conversation) {
      setSelectedConversation(conversationData.conversation);
    }
  }, [conversationIdFromState, conversationData]);

  if (!user) {
    return (
      <div className="min-h-screen bg-light-subtle flex items-center justify-center">
        <p className="text-dark-600">Please log in to access chat</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-subtle">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-dark-900">Messages</h1>
          <p className="text-dark-600 mt-1">Chat with sellers and admins</p>
        </div>

        <div className="glass rounded-xl overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="flex h-full">
            {/* Conversations Sidebar */}
            <div className="w-80 border-r border-dark-200 bg-white">
              <div className="p-4 border-b border-dark-200">
                <h2 className="font-semibold text-dark-900">Conversations</h2>
              </div>
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <ConversationList
                  conversations={data?.conversations || []}
                  selectedConversationId={selectedConversation?.id}
                  onSelectConversation={setSelectedConversation}
                />
              )}
            </div>

            {/* Chat Window */}
            <div className="flex-1 bg-white">
              {selectedConversation ? (
                <ChatWindow
                  conversation={selectedConversation}
                  currentUserId={user.id}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-center p-8">
                  <div>
                    <MessageCircle className="w-16 h-16 text-dark-300 mx-auto mb-4" />
                    <p className="text-dark-600">Select a conversation to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

