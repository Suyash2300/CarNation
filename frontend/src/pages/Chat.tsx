import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  useGetConversationsQuery,
  useGetConversationQuery,
  Conversation,
} from "../services/chatApi";
import { useAppSelector } from "../hooks/redux";
import Navbar from "../components/layout/Navbar";
import ConversationList from "../components/chat/ConversationList";
import ChatWindow from "../components/chat/ChatWindow";
import { MessageCircle, Menu, X, Loader2 } from "lucide-react";

const Chat = () => {
  const { user } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const conversationIdFromState = (
    location.state as { conversationId?: string }
  )?.conversationId;
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [showSidebar, setShowSidebar] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );
  const { data, isLoading } = useGetConversationsQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const { data: conversationData } = useGetConversationQuery(
    conversationIdFromState || "",
    {
      skip: !conversationIdFromState,
    }
  );

  // Set selected conversation from navigation state
  useEffect(() => {
    if (conversationIdFromState && conversationData?.conversation) {
      setSelectedConversation(conversationData.conversation);
      setShowSidebar(false); // Hide sidebar on mobile when conversation is selected
    }
  }, [conversationIdFromState, conversationData]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowSidebar(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-select first conversation on mobile if none selected
  useEffect(() => {
    if (
      !selectedConversation &&
      data?.conversations &&
      data.conversations.length > 0
    ) {
      // Don't auto-select if we're waiting for a specific conversation
      if (!conversationIdFromState) {
        setSelectedConversation(data.conversations[0]);
      }
    }
  }, [data?.conversations, conversationIdFromState, selectedConversation]);

  const sortedConversations = useMemo(() => {
    if (!data?.conversations) return [];
    return [...data.conversations].sort((a, b) => {
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [data?.conversations]);

  if (!user) {
    return (
      <div className="min-h-screen bg-light-subtle dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-dark-300 dark:text-dark-600 mx-auto mb-4" />
          <p className="text-dark-600 dark:text-dark-400 text-lg">
            Please log in to access chat
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-subtle dark:bg-dark-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-dark-900 dark:text-white break-words">
                Messages
              </h1>
              <p className="text-dark-600 dark:text-dark-400 mt-1 text-xs sm:text-sm md:text-base break-words">
                Chat with sellers and admins
              </p>
            </div>
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowSidebar((prev) => !prev)}
              className="lg:hidden p-2 rounded-lg bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 hover:bg-dark-50 dark:hover:bg-dark-700 transition"
              aria-label="Toggle sidebar"
            >
              {showSidebar ? (
                <X className="w-5 h-5 text-dark-900 dark:text-white" />
              ) : (
                <Menu className="w-5 h-5 text-dark-900 dark:text-white" />
              )}
            </button>
          </div>
        </div>

        <div
          className="bg-white dark:bg-dark-800 rounded-xl overflow-hidden shadow-lg border border-dark-200 dark:border-dark-700"
          style={{ height: "calc(100dvh - 180px)", minHeight: "520px" }}
        >
          <div className="flex h-full relative">
            {/* Conversations Sidebar */}
            <div
              className={`${
                showSidebar
                  ? "translate-x-0"
                  : "-translate-x-full lg:translate-x-0"
              } absolute lg:relative z-20 lg:z-auto w-full sm:w-[360px] lg:w-80 border-r border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 h-full transition-transform duration-300 ease-in-out will-change-transform`}
            >
              <div className="h-full flex flex-col">
                <div className="p-3 sm:p-4 border-b border-dark-200 dark:border-dark-700 flex items-center justify-between gap-2 min-w-0">
                  <h2 className="font-semibold text-dark-900 dark:text-white text-sm sm:text-base md:text-lg flex-1 min-w-0 break-words">
                    Conversations
                  </h2>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="lg:hidden p-1 rounded hover:bg-dark-100 dark:hover:bg-dark-700 flex-shrink-0"
                    aria-label="Close sidebar"
                  >
                    <X className="w-4 h-4 text-dark-600 dark:text-dark-400" />
                  </button>
                </div>
                {isLoading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                  </div>
                ) : (
                  <ConversationList
                    conversations={sortedConversations}
                    selectedConversationId={selectedConversation?.id}
                    onSelectConversation={(conv) => {
                      setSelectedConversation(conv);
                      setShowSidebar(false); // Hide sidebar on mobile after selection
                    }}
                  />
                )}
              </div>
            </div>

            {/* Overlay for mobile */}
            {showSidebar && (
              <div
                className="lg:hidden fixed inset-0 bg-black/50 z-10"
                onClick={() => setShowSidebar(false)}
              />
            )}

            {/* Chat Window */}
            <div className="flex-1 bg-white dark:bg-dark-900 min-w-0 flex flex-col">
              {selectedConversation ? (
                <ChatWindow
                  conversation={selectedConversation}
                  currentUserId={user.id}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-center p-8">
                  <div>
                    <MessageCircle className="w-16 h-16 text-dark-300 dark:text-dark-600 mx-auto mb-4" />
                    <p className="text-dark-600 dark:text-dark-400 text-lg font-medium">
                      Select a conversation to start chatting
                    </p>
                    <p className="text-sm text-dark-500 dark:text-dark-500 mt-2">
                      {sortedConversations.length === 0
                        ? "No conversations yet. Start one from a car listing!"
                        : "Choose a conversation from the sidebar"}
                    </p>
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
