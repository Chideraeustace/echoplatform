import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  Database,
  LogOut,
  LayoutDashboard,
  ShoppingCart,
  History,
  Store,
  User,
  Code2,
  Wallet,
  Menu,
  X,
} from "lucide-react";

// Sub-Section Component Directory Mapping
import OverviewSection from "../components/dashboard/OverviewSection";
import OrderSection from "../components/dashboard/OrderSection";
import OrdersSection from "../components/dashboard/OrdersSection";
import StorefrontSection from "../components/dashboard/StorefrontSection";
import ProfileSection from "../components/dashboard/ProfileSection"; // <-- Added Profile Module Component
import ApiSection from "../components/dashboard/ApiSection"; // <-- Added API Integration Module
import WalletSection from "../components/dashboard/WalletSection";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchAgentProfile = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/");
        return;
      }
      try {
        const docRef = doc(db, "echoagents", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAgentData(docSnap.data());
        }
      } catch (err) {
        console.error("Error retrieving ledger telemetry:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a12] text-slate-400 font-mono flex items-center justify-center">
        <span className="animate-pulse">syncing_echoagent_telemetry...</span>
      </div>
    );
  }

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "order", label: "Place Order", icon: ShoppingCart },
    { id: "orders", label: "Order History", icon: History },
    { id: "storefront", label: "Storefront Settings", icon: Store },
    { id: "profile", label: "Agent Profile", icon: User }, // <-- Registered Profile Link
    { id: "api", label: "API Integrations", icon: Code2 }, // <-- Registered API Link
    { id: "wallet", label: "Funding & Wallet", icon: Wallet },
  ];

  // Dynamic conditional renderer execution
  const renderActiveSection = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewSection agentData={agentData} />;
      case "order":
        return <OrderSection agentData={agentData} />;
      case "orders":
        return <OrdersSection userId={auth.currentUser?.uid} />;
      case "storefront":
        return <StorefrontSection agentData={agentData} />;
      case "profile":
        return (
          <ProfileSection
            agentData={agentData}
            userId={auth.currentUser?.uid}
          />
        ); // <-- Directs to Profile
      case "api":
        return <ApiSection agentData={agentData} />; // <-- Directs to API View
      case "wallet":
        return <WalletSection />;
      default:
        return <OverviewSection agentData={agentData} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 font-sans flex">
      {/* MOBILE SIDEBAR TOGGLE */}
      <div className="lg:hidden absolute top-5 right-6 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION PANEL */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800/80 p-6 flex flex-col justify-between transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="space-y-8">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-lg font-black tracking-tight text-white">
              <Database className="text-emerald-400 h-5 w-5" />
              <span>
                Echo<span className="text-emerald-400">data</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono tracking-wide mt-1 truncate max-w-[200px]">
              {agentData?.dataSellingName || "Agent Node"}
            </span>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 rounded-xl transition-all"
        >
          <LogOut className="h-4 w-4" />
          Disconnect Node
        </button>
      </aside>

      {/* CORE DISPLAY ROUTER */}
      <div className="flex-1 min-h-screen flex flex-col overflow-y-auto">
        <header className="h-20 border-b border-slate-800/60 bg-slate-900/20 backdrop-blur-md px-6 lg:px-10 flex items-center justify-between sticky top-0 z-30">
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-slate-300 uppercase tracking-wider font-mono">
              {`// section_view_${activeSection}`}
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-slate-400 bg-slate-950/60 border border-slate-800 px-4 py-2 rounded-xl">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Node ID: {auth.currentUser?.uid.slice(0, 8)}...</span>
          </div>
        </header>

        <main className="p-6 lg:p-10 max-w-6xl w-full mx-auto flex-1">
          {renderActiveSection()}
        </main>
      </div>
    </div>
  );
}
