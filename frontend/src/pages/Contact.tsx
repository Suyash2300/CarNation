import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../hooks/redux";
import { useCreateConversationMutation } from "../services/chatApi";
import { getApiBaseUrl } from "../utils/env";

const Contact = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const [createConversation, { isLoading: isCreating }] =
    useCreateConversationMutation();

  const getSupportUserId = async (): Promise<string> => {
    // Try optional backend endpoint; fallback to navigate to chat without preselect
    try {
      const apiUrl = getApiBaseUrl();
      const res = await fetch(`${apiUrl}/support-user?role=ADMIN`, {
        credentials: "include",
      });
      if (res.ok) {
        const data: { userId?: string } = await res.json();
        return data.userId ?? "";
      }
    } catch (e) {
      // ignore
    }
    // As a fallback, open chat list
    return "";
  };

  const startChat = async () => {
    if (!isAuthenticated) return navigate("/auth");
    const adminId = await getSupportUserId();
    if (!adminId) {
      // No specific admin returned; go to chat list
      return navigate("/chat");
    }
    try {
      const res = await createConversation({ otherUserId: adminId }).unwrap();
      navigate("/support-chat", {
        state: { conversationId: res.conversation.id },
      });
    } catch {
      navigate("/support-chat");
    }
  };
  return (
    <div className="min-h-screen bg-light-subtle">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* Header */}
        <section className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-dark-900">
            We’re here to help
          </h1>
          <p className="text-lg text-dark-600 mt-2">
            Reach out to us for rentals, purchases, or general support.
          </p>
        </section>

        {/* Contact Methods */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Mail, title: "General", detail: "support@carnation.app" },
            {
              icon: Phone,
              title: "Sales & Rentals",
              detail: "+91 98765 43210",
            },
            {
              icon: MessageCircle,
              title: "Chat",
              detail: "Use in-app chat for quick help",
            },
          ].map((c, i) => (
            <div key={i} className="glass rounded-2xl p-6 flex gap-3">
              <c.icon className="w-6 h-6 text-primary-600 mt-1" />
              <div>
                <p className="font-bold text-dark-900">{c.title}</p>
                <p className="text-dark-600 text-sm">{c.detail}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Contact Form */}
        <section className="glass rounded-2xl p-6 md:p-8 mb-10">
          <h2 className="text-2xl font-bold text-dark-900 mb-4">
            Send us a message
          </h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-2">
                Full Name
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border-2 border-dark-200 focus:border-primary-600 outline-none"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-xl border-2 border-dark-200 focus:border-primary-600 outline-none"
                placeholder="you@example.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-dark-700 mb-2">
                Subject
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border-2 border-dark-200 focus:border-primary-600 outline-none"
                placeholder="How can we help?"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-dark-700 mb-2">
                Message
              </label>
              <textarea
                rows={5}
                className="w-full px-4 py-3 rounded-xl border-2 border-dark-200 focus:border-primary-600 outline-none"
                placeholder="Write your message..."
              />
            </div>
            <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-dark-600">
                <input type="checkbox" className="rounded" /> I agree to the
                Terms & Privacy Policy
              </label>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-primary text-white font-bold shadow-md hover:shadow-lg"
                >
                  Send Message
                </button>
                <button
                  type="button"
                  onClick={startChat}
                  disabled={isCreating}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold shadow-md hover:shadow-lg"
                >
                  {isCreating ? "Starting..." : "Chat with us"}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Locations */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-dark-900 mb-4">Locations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { city: "Mumbai", desc: "Head office & operations" },
              { city: "Pune", desc: "Customer success" },
              { city: "Bengaluru", desc: "Tech & product" },
            ].map((l, i) => (
              <div key={i} className="glass rounded-2xl p-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <p className="font-bold text-dark-900">{l.city}</p>
                </div>
                <p className="text-sm text-dark-600 mt-1">{l.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
