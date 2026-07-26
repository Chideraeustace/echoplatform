import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import PublicStorePage from "./pages/PublicStorePage";

// Domains where customers buy bundles — agent-only routes (login/signup)
// redirect back to the landing page here. Keep this list in sync with the
// one in LandingPage.jsx.
const CUSTOMER_ONLY_DOMAINS = ["echodata.xyz", "www.echodata.xyz"];

// --- REFRESH-PROOF ROUTE WRAPPER ---
function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a12] text-slate-400 font-mono flex items-center justify-center">
        <span className="animate-pulse">authorizing_secure_session...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// --- AGENT-ONLY ROUTE WRAPPER ---
// Blocks /login and /signup on customer-facing domains (echodata.xyz),
// even if someone types the URL directly. Agents still reach these on
// your Vercel domain.
function AgentOnlyRoute({ children }) {
  const isCustomerDomain = CUSTOMER_ONLY_DOMAINS.includes(
    window.location.hostname,
  );

  if (isCustomerDomain) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/login"
          element={
            <AgentOnlyRoute>
              <AuthPage mode="login" />
            </AgentOnlyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <AgentOnlyRoute>
              <AuthPage mode="signup" />
            </AgentOnlyRoute>
          }
        />

        {/* DYNAMIC PUBLIC CUSTOMER STORE LINK ROUTE */}
        <Route path="/store/:storeSlug" element={<PublicStorePage />} />

        {/* Dashboard route protection */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
