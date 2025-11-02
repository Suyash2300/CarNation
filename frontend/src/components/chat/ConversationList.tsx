import { Conversation } from '../../services/chatApi';
import { useAppSelector } from '../../hooks/redux';
import { MessageCircle } from 'lucide-react';

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

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participant1Id === user?.id
      ? conversation.participant2
      : conversation.participant1;
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <MessageCircle className="w-16 h-16 text-dark-300 mb-4" />
          <p className="text-dark-600">No conversations yet</p>
          <p className="text-sm text-dark-500 mt-2">
            Start a conversation from a car listing
          </p>
        </div>
      ) : (
        <div className="divide-y divide-dark-200">
          {conversations.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation);
            const unreadCount = conversation._count?.messages || 0;
            const isSelected = conversation.id === selectedConversationId;

            return (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`w-full p-4 hover:bg-dark-50 transition text-left ${
                  isSelected ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {otherParticipant.profileImage ? (
                    <img
                      src={otherParticipant.profileImage}
                      alt={otherParticipant.name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-700 font-semibold">
                        {otherParticipant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-dark-900 truncate">
                        {otherParticipant.name}
                      </h3>
                      {conversation.lastMessageAt && (
                        <span className="text-xs text-dark-500 flex-shrink-0 ml-2">
                          {formatTime(conversation.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    {conversation.car && (
                      <p className="text-xs text-primary-600 mb-1 truncate">
                        {conversation.car.brand} {conversation.car.model} ({conversation.car.year})
                      </p>
                    )}
                    <p className="text-sm text-dark-600 truncate">
                      {conversation.lastMessage || 'No messages yet'}
                    </p>
                    {unreadCount > 0 && (
                      <span className="inline-block mt-1 bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConversationList;

