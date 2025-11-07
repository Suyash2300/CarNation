import { memo } from 'react';
import { Message } from '../../services/chatApi';
import { useAppSelector } from '../../hooks/redux';
import { Check, CheckCheck } from 'lucide-react';
import LazyImage from '../common/LazyImage';

interface MessageBubbleProps {
  message: Message;
  currentUserIdOverride?: string;
  showAvatar?: boolean;
  showDateSeparator?: boolean;
  isFirstInGroup?: boolean;
}

const MessageBubble = ({ 
  message, 
  currentUserIdOverride,
  showAvatar = true,
  showDateSeparator = false,
  isFirstInGroup = false,
}: MessageBubbleProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const effectiveUserId = currentUserIdOverride || user?.id;
  const isOwnMessage = message.senderId === effectiveUserId;

  const messageDate = new Date(message.createdAt);
  const timeString = messageDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      {showDateSeparator && (
        <div className="flex items-center justify-center my-4">
          <div className="bg-dark-200 dark:bg-dark-700 px-3 py-1 rounded-full">
            <span className="text-xs text-dark-600 dark:text-dark-400">
              {messageDate.toLocaleDateString([], {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      )}
      <div
        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-1 group`}
      >
        <div className={`flex max-w-[75%] sm:max-w-[65%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} gap-2 items-end`}>
          {!isOwnMessage && showAvatar && (
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0 ${isFirstInGroup ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'}`}>
              {message.sender.profileImage ? (
                <LazyImage
                  src={message.sender.profileImage}
                  alt={message.sender.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-semibold text-xs">
                  {message.sender.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          )}
          {isOwnMessage && !showAvatar && <div className="w-8" />}
          <div
            className={`rounded-2xl px-4 py-2.5 shadow-sm ${
              isOwnMessage
                ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-tr-sm'
                : 'bg-white dark:bg-dark-800 text-dark-900 dark:text-white border border-dark-200 dark:border-dark-700 rounded-tl-sm'
            }`}
          >
            {!isOwnMessage && (
              <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-1">
                {message.sender.name}
              </p>
            )}
            <p className="text-sm break-words whitespace-pre-wrap leading-relaxed">{message.content}</p>
            {message.imageUrl && (
              <div className="mt-2 rounded-lg overflow-hidden max-w-full">
                <LazyImage
                  src={message.imageUrl}
                  alt="Message attachment"
                  className="max-w-full h-auto max-h-80 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(message.imageUrl, '_blank')}
                />
              </div>
            )}
            <div className={`flex items-center gap-1.5 mt-1.5 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              <span className={`text-xs ${isOwnMessage ? 'text-primary-100' : 'text-dark-500 dark:text-dark-400'}`}>
                {timeString}
              </span>
              {isOwnMessage && (
                <span className={`${message.isRead ? 'text-blue-300' : 'text-primary-200'}`}>
                  {message.isRead ? (
                    <CheckCheck className="w-3.5 h-3.5" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(MessageBubble);

