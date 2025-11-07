import { memo, useMemo, useState, useCallback } from "react";
import { Conversation } from "../../services/chatApi";
import { useAppSelector } from "../../hooks/redux";
import { MessageCircle, Search, X } from "lucide-react";
import LazyImage from "../common/LazyImage";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
}

const ConversationList = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
}: ConversationListProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");

  const getOtherParticipant = useCallback(
    (conversation: Conversation) => {
      return conversation.participant1Id === user?.id
        ? conversation.participant2
        : conversation.participant1;
    },
    [user?.id]
  );

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter((conv) => {
      const other = getOtherParticipant(conv);
      const nameMatch = other.name.toLowerCase().includes(query);
      const messageMatch = conv.lastMessage?.toLowerCase().includes(query);
      const carMatch = conv.car
        ? `${conv.car.brand} ${conv.car.model}`.toLowerCase().includes(query)
        : false;
      return nameMatch || messageMatch || carMatch;
    });
  }, [conversations, getOtherParticipant, searchQuery]);

  const sortedConversations = useMemo(() => {
    return [...filteredConversations].sort((a, b) => {
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [filteredConversations]);

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-3 border-b border-dark-200 dark:border-dark-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-8 py-2 bg-dark-50 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {sortedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageCircle className="w-16 h-16 text-dark-300 dark:text-dark-600 mb-4" />
            <p className="text-dark-600 dark:text-dark-400 font-medium">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </p>
            <p className="text-sm text-dark-500 dark:text-dark-500 mt-2">
              {searchQuery
                ? "Try a different search term"
                : "Start a conversation from a car listing"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-dark-200 dark:divide-dark-700">
            {sortedConversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              const unreadCount = conversation._count?.messages || 0;
              const isSelected = conversation.id === selectedConversationId;

              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`w-full p-3 hover:bg-dark-50 dark:hover:bg-dark-800 transition text-left ${
                    isSelected
                      ? "bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-l-4 border-primary-600"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      {otherParticipant.profileImage ? (
                        <LazyImage
                          src={otherParticipant.profileImage}
                          alt={otherParticipant.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {otherParticipant.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-error rounded-full flex items-center justify-center border-2 border-white dark:border-dark-800">
                          <span className="text-white text-xs font-bold">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-dark-900 dark:text-white text-xs sm:text-sm break-words flex-1 min-w-0">
                          {otherParticipant.name}
                        </h3>
                        {conversation.lastMessageAt && (
                          <span className="text-xs text-dark-500 dark:text-dark-400 flex-shrink-0 whitespace-nowrap">
                            {formatTime(conversation.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      {conversation.car && (
                        <p className="text-xs text-primary-600 dark:text-primary-400 mb-1 break-words font-medium">
                          {conversation.car.brand} {conversation.car.model} (
                          {conversation.car.year})
                        </p>
                      )}
                      <p
                        className={`text-xs sm:text-sm break-words line-clamp-2 ${
                          unreadCount > 0
                            ? "text-dark-900 dark:text-white font-medium"
                            : "text-dark-600 dark:text-dark-400"
                        }`}
                      >
                        {conversation.lastMessage || "No messages yet"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(ConversationList);
