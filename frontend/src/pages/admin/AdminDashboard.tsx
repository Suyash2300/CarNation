import { useState } from "react";
import { useAppSelector } from "../../hooks/redux";
import Navbar from "../../components/layout/Navbar";
import AdminOverview from "../../components/admin/AdminOverview";
import CarManagement from "../../components/admin/CarManagement";
import RentalManagement from "../../components/admin/RentalManagement";
import SupportChats from "../../components/admin/SupportChats";
import ShopLocations from "../../components/admin/ShopLocations";
import UserVerification from "../../components/admin/UserVerification";
import UserManagement from "../../components/admin/UserManagement";
import PlatformFeeSettings from "../../components/admin/PlatformFeeSettings";
import TransactionReport from "../../components/admin/TransactionReport";
import {
  LayoutDashboard,
  Car,
  Users,
  Shield,
  TrendingUp,
  DollarSign,
  MessageCircle,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [activeSection, setActiveSection] = useState<
    | "overview"
    | "cars"
    | "rentals"
    | "verification"
    | "users"
    | "platform"
    | "transactions"
    | "support"
    | "shops"
  >("overview");

  if (user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-light-subtle flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-dark-900 mb-2">
            Access Denied
          </h2>
          <p className="text-dark-700">Admin access required.</p>
        </div>
      </div>
    );
  }

  const sections = [
    { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
    { id: "cars" as const, label: "Car Management", icon: Car },
    { id: "rentals" as const, label: "Rentals & Earnings", icon: TrendingUp },
    { id: "support" as const, label: "Support Chats", icon: MessageCircle },
    { id: "shops" as const, label: "Shop Locations", icon: MapPin },
    {
      id: "verification" as const,
      label: "Aadhaar Verification",
      icon: Shield,
    },
    { id: "users" as const, label: "User Management", icon: Users },
    { id: "platform" as const, label: "Platform Settings", icon: DollarSign },
    {
      id: "transactions" as const,
      label: "Transaction Report",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen bg-light-subtle">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-dark-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-dark-700">Welcome back, {user?.name}</p>
          </div>
          <Link
            to="/chat"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition shadow-lg hover:shadow-xl"
          >
            <MessageCircle className="w-5 h-5" />
            Messages
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="glass rounded-xl p-4 space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeSection === section.id
                        ? "bg-gradient-primary text-white shadow-lg"
                        : "text-dark-700 hover:bg-dark-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="glass rounded-xl p-6 lg:p-8 overflow-hidden">
              {activeSection === "overview" && <AdminOverview />}
              {activeSection === "cars" && <CarManagement />}
              {activeSection === "rentals" && <RentalManagement />}
              {activeSection === "support" && <SupportChats />}
              {activeSection === "shops" && <ShopLocations />}
              {activeSection === "verification" && <UserVerification />}
              {activeSection === "users" && <UserManagement />}
              {activeSection === "platform" && <PlatformFeeSettings />}
              {activeSection === "transactions" && <TransactionReport />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
