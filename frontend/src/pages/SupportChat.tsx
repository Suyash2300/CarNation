import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "../hooks/redux";
import Navbar from "../components/layout/Navbar";
import ConversationList from "../components/chat/ConversationList";
import ChatWindow from "../components/chat/ChatWindow";
import { MessageCircle, Eye } from "lucide-react";
import {
  useGetConversationsQuery,
  useGetConversationQuery,
  type Conversation,
} from "../services/chatApi";
import { getSocketWithToken } from "../services/socket";

const SupportChat = () => {
  const { user } = useAppSelector((s) => s.auth);
  const location = useLocation();
  const conversationIdFromState = (
    location.state as { conversationId?: string }
  )?.conversationId;
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
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

  // Focus the conversation passed from navigation
  useEffect(() => {
    if (conversationIdFromState && conversationData?.conversation) {
      setSelectedConversation(conversationData.conversation);
    }
  }, [conversationIdFromState, conversationData]);

  // Only support conversations: conversations without a carId
  const supportConversations = useMemo(
    () => (data?.conversations || []).filter((c) => !c.carId),
    [data?.conversations]
  );
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowSidebar(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const startPreview = async () => {
    if (!selectedConversation) return;
    // Call backend to mint short-lived token for the other participant
    const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";
    const res = await fetch(
      `${apiUrl}/admin/conversations/${selectedConversation.id}/impersonate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        credentials: "include",
      }
    );
    if (res.ok) {
      const json = await res.json();
      setPreviewToken(json.token);
      const preview = getSocketWithToken(json.token);
      // Join room on preview socket too
      preview.emit("join-conversation", {
        conversationId: selectedConversation.id,
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-light-subtle flex items-center justify-center">
        <p className="text-dark-600">Please log in to access support chat</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-subtle">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="mb-4 sm:mb-6 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-dark-900 break-words">
              Platform Support
            </h1>
            <p className="text-dark-600 mt-1 text-sm sm:text-base break-words">
              Chat with the CarNation support team
            </p>
          </div>
          <button
            onClick={() => setShowSidebar((prev) => !prev)}
            className="lg:hidden p-2 rounded-lg bg-white border border-dark-200 hover:bg-dark-50 transition"
            aria-label="Toggle support threads"
          >
            {showSidebar ? "Close" : "Threads"}
          </button>
        </div>

        <div
          className="glass rounded-xl overflow-hidden"
          style={{ height: "calc(100dvh - 200px)", minHeight: "520px" }}
        >
          <div className="flex h-full relative">
            {/* Sidebar */}
            <div
              className={`${
                showSidebar
                  ? "translate-x-0"
                  : "-translate-x-full lg:translate-x-0"
              } absolute lg:relative z-20 lg:z-auto w-full sm:w-[320px] lg:w-80 border-r border-dark-200 bg-white h-full transition-transform duration-300 ease-in-out will-change-transform`}
            >
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-dark-200 flex items-center justify-between gap-2">
                  <h2 className="font-semibold text-dark-900 text-base sm:text-lg">
                    Support Threads
                  </h2>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="lg:hidden text-sm text-dark-500 hover:text-dark-700"
                  >
                    Close
                  </button>
                </div>
                {isLoading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : (
                  <ConversationList
                    conversations={supportConversations}
                    selectedConversationId={selectedConversation?.id}
                    onSelectConversation={(conversation) => {
                      setSelectedConversation(conversation);
                      setShowSidebar(false);
                    }}
                  />
                )}
              </div>
            </div>

            {/* Overlay */}
            {showSidebar && (
              <div
                className="lg:hidden fixed inset-0 bg-black/40 z-10"
                onClick={() => setShowSidebar(false)}
              />
            )}

            {/* Chat column(s) */}
            <div
              className={`flex-1 min-w-0 bg-white flex flex-col ${
                previewToken ? "lg:flex-row" : ""
              }`}
            >
              <div
                className={`${
                  previewToken ? "lg:w-1/2 border-r border-dark-200" : "flex-1"
                } min-h-0 bg-white`}
              >
                {selectedConversation ? (
                  <ChatWindow
                    conversation={selectedConversation}
                    currentUserId={user.id}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-center p-8">
                    <div>
                      <MessageCircle className="w-16 h-16 text-dark-300 mx-auto mb-4" />
                      <p className="text-dark-600">
                        Select a support thread to chat
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {previewToken && (
                <div className="flex-1 min-h-0 bg-white relative hidden lg:block">
                  <div className="absolute top-2 right-2 z-10">
                    <span className="px-2 py-1 rounded-md text-xs bg-dark-100 text-dark-700">
                      User Preview
                    </span>
                  </div>
                  {selectedConversation ? (
                    <ChatWindow
                      conversation={selectedConversation}
                      currentUserId={
                        selectedConversation.participant1Id === user.id
                          ? selectedConversation.participant2Id
                          : selectedConversation.participant1Id
                      }
                      socketTokenOverride={previewToken}
                    />
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <button
            onClick={startPreview}
            disabled={!selectedConversation}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-md disabled:opacity-60"
          >
            <Eye className="w-4 h-4" /> Preview as User
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupportChat;
