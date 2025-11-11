import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Conversation, Message } from "../../services/chatApi";
import { useGetMessagesQuery } from "../../services/chatApi";
import { getSocket, getSocketWithToken } from "../../services/socket";
import MessageBubble from "./MessageBubble";
import DealButton from "./DealButton";
import { Send, ArrowDown, Loader2 } from "lucide-react";
import LazyImage from "../common/LazyImage";

interface ChatWindowProps {
  conversation: Conversation;
  currentUserId: string;
  socketTokenOverride?: string;
  currentUserIdOverride?: string;
}

const ChatWindow = ({
  conversation,
  currentUserId,
  socketTokenOverride,
  currentUserIdOverride,
}: ChatWindowProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [socket, setSocket] = useState<ReturnType<typeof getSocket> | null>(
    null
  );
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const effectiveUserId = currentUserIdOverride || currentUserId;

  const {
    data: messagesData,
    isLoading,
    refetch,
  } = useGetMessagesQuery(
    {
      conversationId: conversation.id,
      limit: 50,
    },
    {
      refetchOnFocus: false,
      refetchOnReconnect: true,
    }
  );

  // Group messages by date and determine if avatar should be shown
  const groupedMessages = useMemo(() => {
    if (!messages.length) return [];

    const grouped: Array<{
      date: string;
      messages: Array<
        Message & {
          showAvatar: boolean;
          showDateSeparator: boolean;
          isFirstInGroup: boolean;
        }
      >;
    }> = [];

    let currentDate = "";
    let lastSenderId: string | null = null;

    messages.forEach((msg, index) => {
      const msgDate = new Date(msg.createdAt).toDateString();
      const isNewDate = msgDate !== currentDate;
      const isNewSender = msg.senderId !== lastSenderId;
      const isFirstInGroup = index === 0 || isNewDate || isNewSender;

      if (isNewDate) {
        currentDate = msgDate;
        grouped.push({
          date: currentDate,
          messages: [],
        });
      }

      grouped[grouped.length - 1].messages.push({
        ...msg,
        showAvatar: isFirstInGroup,
        showDateSeparator: index === 0 || isNewDate,
        isFirstInGroup,
      });

      lastSenderId = msg.senderId;
    });

    return grouped;
  }, [messages]);

  const scrollMessagesToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      const container = messagesContainerRef.current;
      if (!container) return;

      container.scrollTo({
        top: container.scrollHeight,
        behavior,
      });
    },
    []
  );

  useEffect(() => {
    const socketInstance = socketTokenOverride
      ? getSocketWithToken(socketTokenOverride)
      : getSocket();
    if (socketInstance) {
      setSocket(socketInstance);

      // Join conversation room
      socketInstance.emit("join-conversation", {
        conversationId: conversation.id,
      });

      // Listen for new messages
      socketInstance.on("new-message", (newMessage: Message) => {
        if (newMessage.conversationId === conversation.id) {
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
          // Auto-scroll to bottom on new message
          setTimeout(() => {
            scrollMessagesToBottom("smooth");
          }, 100);
        }
      });

      // Listen for typing indicators
      socketInstance.on(
        "user-typing",
        (data: {
          userId: string;
          conversationId: string;
          userName?: string;
        }) => {
          if (
            data.conversationId === conversation.id &&
            data.userId !== effectiveUserId
          ) {
            setIsTyping(true);
            setTypingUser(data.userName || "Someone");
          }
        }
      );

      socketInstance.on(
        "user-stopped-typing",
        (data: { userId: string; conversationId: string }) => {
          if (
            data.conversationId === conversation.id &&
            data.userId !== effectiveUserId
          ) {
            setIsTyping(false);
            setTypingUser(null);
          }
        }
      );

      // Listen for messages read
      socketInstance.on("messages-read", () => {
        refetch();
      });
    }

    return () => {
      if (socketInstance) {
        socketInstance.emit("leave-conversation", {
          conversationId: conversation.id,
        });
        socketInstance.off("new-message");
        socketInstance.off("user-typing");
        socketInstance.off("user-stopped-typing");
        socketInstance.off("messages-read");
      }
    };
  }, [
    conversation.id,
    effectiveUserId,
    refetch,
    socketTokenOverride,
    scrollMessagesToBottom,
  ]);

  useEffect(() => {
    if (messagesData) {
      setMessages(messagesData.messages);
      // Scroll to bottom on initial load
      setTimeout(() => {
        scrollMessagesToBottom("auto");
      }, 100);
    }
  }, [messagesData, scrollMessagesToBottom]);

  // Handle scroll to show/hide scroll button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const { scrollTop, scrollHeight, clientHeight } = container;
          const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
          setShowScrollButton(!isNearBottom);
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = useCallback(() => {
    scrollMessagesToBottom("smooth");
  }, [scrollMessagesToBottom]);

  const handleSendMessage = useCallback(() => {
    if (!message.trim() || !socket) return;

    socket.emit("send-message", {
      conversationId: conversation.id,
      content: message.trim(),
    });

    setMessage("");
    inputRef.current?.focus();

    // Stop typing indicator
    if (socket) {
      socket.emit("stop-typing", { conversationId: conversation.id });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-scroll after sending
    setTimeout(() => {
      scrollMessagesToBottom("smooth");
    }, 100);
  }, [message, socket, conversation.id, scrollMessagesToBottom]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = useCallback(
    (value: string) => {
      setMessage(value);

      // Auto-resize textarea
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
        inputRef.current.style.height = `${Math.min(
          inputRef.current.scrollHeight,
          128
        )}px`;
      }

      if (socket) {
        socket.emit("typing", { conversationId: conversation.id });

        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
          if (socket) {
            socket.emit("stop-typing", { conversationId: conversation.id });
          }
        }, 1000);
      }
    },
    [socket, conversation.id]
  );

  const otherParticipant =
    conversation.participant1Id === effectiveUserId
      ? conversation.participant2
      : conversation.participant1;

  return (
    <div className="flex flex-col h-full min-h-0 bg-white dark:bg-dark-900">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-dark-800 dark:to-dark-700 border-b border-dark-200 dark:border-dark-700 p-3 sm:p-4 flex items-center gap-2 sm:gap-3 shadow-sm min-w-0 flex-shrink-0">
        {otherParticipant.profileImage ? (
          <LazyImage
            src={otherParticipant.profileImage}
            alt={otherParticipant.name}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white dark:border-dark-600 flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center border-2 border-white dark:border-dark-600 flex-shrink-0">
            <span className="text-white font-semibold text-base sm:text-lg">
              {otherParticipant.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0 overflow-hidden">
          <h3 className="font-semibold text-dark-900 dark:text-white text-sm sm:text-base md:text-lg break-words leading-tight">
            {otherParticipant.name}
          </h3>
          {isTyping ? (
            <p className="text-xs sm:text-sm text-primary-600 dark:text-primary-400 flex items-center gap-1 flex-wrap">
              <span className="inline-block w-1 h-1 bg-primary-600 rounded-full animate-pulse"></span>
              <span className="inline-block w-1 h-1 bg-primary-600 rounded-full animate-pulse delay-75"></span>
              <span className="inline-block w-1 h-1 bg-primary-600 rounded-full animate-pulse delay-150"></span>
              <span className="ml-1 break-words">
                {typingUser} is typing...
              </span>
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-dark-500 dark:text-dark-400 break-words">
              {conversation.car
                ? `${conversation.car.brand} ${conversation.car.model} (${conversation.car.year})`
                : "Online"}
            </p>
          )}
        </div>
        {conversation.car && <DealButton conversation={conversation} />}
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 bg-gradient-to-b from-light-subtle to-white dark:from-dark-900 dark:to-dark-800 relative scroll-smooth overscroll-contain"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : groupedMessages.length === 0 ? (
          <div className="text-center text-dark-600 dark:text-dark-400 mt-8">
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm mt-2">Start the conversation!</p>
          </div>
        ) : (
          <>
            {groupedMessages.map((group) =>
              group.messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  currentUserIdOverride={effectiveUserId}
                  showAvatar={msg.showAvatar}
                  showDateSeparator={msg.showDateSeparator}
                  isFirstInGroup={msg.isFirstInGroup}
                />
              ))
            )}
          </>
        )}

        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-all hover:scale-110 z-10"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-dark-200 dark:border-dark-700 p-4 bg-white dark:bg-dark-900">
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
            rows={1}
            className="flex-1 px-4 py-2.5 border border-dark-300 dark:border-dark-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-dark-900 dark:text-white resize-none max-h-32 overflow-y-auto"
            style={{ minHeight: "42px" }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="w-full sm:w-auto bg-gradient-to-r from-primary-500 to-primary-600 text-white px-5 py-2.5 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:hover:shadow-md"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
