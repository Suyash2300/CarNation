import { useState, useEffect, useRef } from 'react';
import { Conversation, Message } from '../../services/chatApi';
import { useGetMessagesQuery } from '../../services/chatApi';
import { getSocket } from '../../services/socket';
import MessageBubble from './MessageBubble';
import DealButton from './DealButton';
import { Send, Image as ImageIcon } from 'lucide-react';

interface ChatWindowProps {
  conversation: Conversation;
  currentUserId: string;
}

const ChatWindow = ({ conversation, currentUserId }: ChatWindowProps) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState<ReturnType<typeof getSocket> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: messagesData, refetch } = useGetMessagesQuery({
    conversationId: conversation.id,
    limit: 50,
  });

  useEffect(() => {
    const socketInstance = getSocket();
    if (socketInstance) {
      setSocket(socketInstance);

      // Join conversation room
      socketInstance.emit('join-conversation', { conversationId: conversation.id });

      // Listen for new messages
      socketInstance.on('new-message', (newMessage: Message) => {
        if (newMessage.conversationId === conversation.id) {
          setMessages((prev) => [...prev, newMessage]);
        }
      });

      // Listen for typing indicators
      socketInstance.on('user-typing', (data: { userId: string; conversationId: string }) => {
        if (data.conversationId === conversation.id && data.userId !== currentUserId) {
          setIsTyping(true);
        }
      });

      socketInstance.on('user-stopped-typing', (data: { userId: string; conversationId: string }) => {
        if (data.conversationId === conversation.id && data.userId !== currentUserId) {
          setIsTyping(false);
        }
      });

      // Listen for messages read
      socketInstance.on('messages-read', () => {
        refetch();
      });
    }

    return () => {
      if (socketInstance) {
        socketInstance.emit('leave-conversation', { conversationId: conversation.id });
        socketInstance.off('new-message');
        socketInstance.off('user-typing');
        socketInstance.off('user-stopped-typing');
        socketInstance.off('messages-read');
      }
    };
  }, [conversation.id, currentUserId, refetch]);

  useEffect(() => {
    if (messagesData) {
      setMessages(messagesData.messages);
    }
  }, [messagesData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !socket) return;

    socket.emit('send-message', {
      conversationId: conversation.id,
      content: message.trim(),
    });

    setMessage('');

    // Stop typing indicator
    if (socket) {
      socket.emit('stop-typing', { conversationId: conversation.id });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (value: string) => {
    setMessage(value);

    if (socket) {
      socket.emit('typing', { conversationId: conversation.id });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        if (socket) {
          socket.emit('stop-typing', { conversationId: conversation.id });
        }
      }, 1000);
    }
  };

  const otherParticipant = conversation.participant1Id === currentUserId
    ? conversation.participant2
    : conversation.participant1;

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-dark-100 border-b border-dark-200 p-4 flex items-center gap-3">
        {otherParticipant.profileImage ? (
          <img
            src={otherParticipant.profileImage}
            alt={otherParticipant.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center">
            <span className="text-primary-700 font-semibold">
              {otherParticipant.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-dark-900">{otherParticipant.name}</h3>
          {isTyping && (
            <p className="text-xs text-dark-600">typing...</p>
          )}
        </div>
        {conversation.car && (
          <DealButton conversation={conversation} />
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-light-subtle">
        {messages.length === 0 ? (
          <div className="text-center text-dark-600 mt-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-dark-200 p-4 bg-white">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;

