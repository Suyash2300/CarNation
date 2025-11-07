import { useNavigate } from "react-router-dom";
import { useGetConversationsQuery } from "../../services/chatApi";
import { MessageCircle, User, Clock } from "lucide-react";

const SupportChats = () => {
  const { data, isLoading } = useGetConversationsQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const navigate = useNavigate();

  const conversations = (data?.conversations || []).filter((c) => !c.carId);

  if (isLoading) {
    return <div className="text-center py-8">Loading support chats...</div>;
  }

  if (conversations.length === 0) {
    return (
      <div className="glass rounded-xl p-6 text-center">
        <MessageCircle className="w-8 h-8 text-dark-400 mx-auto mb-2" />
        <p className="text-dark-600">No support chats yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conversations.map((c) => {
        const user = c.participant1.role === "ADMIN" ? c.participant2 : c.participant1;
        return (
          <div key={c.id} className="glass rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-dark-900">{user.name}</p>
                <p className="text-sm text-dark-600 line-clamp-1">{c.lastMessage || "No messages yet"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-1 text-sm text-dark-500">
                <Clock className="w-4 h-4" />
                <span>{new Date(c.updatedAt || c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
              </div>
              <button
                onClick={() => navigate("/support-chat", { state: { conversationId: c.id } })}
                className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-md hover:shadow-lg"
              >
                Open
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SupportChats;


