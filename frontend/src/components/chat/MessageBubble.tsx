import { Message } from '../../services/chatApi';
import { useAppSelector } from '../../hooks/redux';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const isOwnMessage = message.senderId === user?.id;

  return (
    <div
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
        {!isOwnMessage && (
          <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center flex-shrink-0">
            {message.sender.profileImage ? (
              <img
                src={message.sender.profileImage}
                alt={message.sender.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-primary-700 font-semibold text-sm">
                {message.sender.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwnMessage
              ? 'bg-primary-600 text-white rounded-tr-sm'
              : 'bg-dark-100 text-dark-900 rounded-tl-sm'
          }`}
        >
          <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
          {message.imageUrl && (
            <img
              src={message.imageUrl}
              alt="Message attachment"
              className="mt-2 rounded-lg max-w-full h-auto max-h-64 object-cover"
            />
          )}
          <div className={`text-xs mt-1 ${isOwnMessage ? 'text-primary-100' : 'text-dark-600'}`}>
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
            {message.isRead && isOwnMessage && (
              <span className="ml-2">✓✓</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;

