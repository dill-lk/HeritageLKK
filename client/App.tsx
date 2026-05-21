import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { isAdminSignedIn } from "@/lib/adminAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Quests from "./pages/Quests";
import Scanner from "./pages/Scanner";
import NotFound from "./pages/NotFound";

import Explore from "./pages/Explore";
import Archive from "./pages/Archive";
import ArchiveDetail from "./pages/ArchiveDetail";
import ReportDamage from "./pages/ReportDamage";
import ContributeArchive from "./pages/ContributeArchive";
import ShingoAi from "./pages/ShingoAi";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const AuthCallback = ({
  isReady,
  session,
  isAdmin,
}: {
  isReady: boolean;
  session: Session | null;
  isAdmin: boolean;
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    navigate(session || isAdmin ? "/home" : "/login", { replace: true });
  }, [isAdmin, isReady, navigate, session]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#100E0A] px-6 text-center text-[#FEFAE0]">
      Completing verification...
    </div>
  );
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const syncAdminSession = () => setIsAdmin(isAdminSignedIn());
    syncAdminSession();
    window.addEventListener("storage", syncAdminSession);
    window.addEventListener("heritagelk-admin-auth", syncAdminSession);

    if (!supabase) {
      setIsAuthReady(true);
      return () => {
        window.removeEventListener("storage", syncAdminSession);
        window.removeEventListener("heritagelk-admin-auth", syncAdminSession);
      };
    }

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsAuthReady(true);
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("storage", syncAdminSession);
      window.removeEventListener("heritagelk-admin-auth", syncAdminSession);
    };
  }, []);

  const isAuthenticated = Boolean(session) || isAdmin;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} />
            <Route
              path="/auth/callback"
              element={<AuthCallback isReady={isAuthReady} session={session} isAdmin={isAdmin} />}
            />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />} />
            <Route path="/signup" element={isAuthenticated ? <Navigate to="/home" replace /> : <Index />} />
            <Route path="/home" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/quests" element={<Quests />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/archive/upload" element={<ContributeArchive />} />
            <Route path="/archive/shingo" element={<ShingoAi />} />
            <Route path="/archive/admin/generate" element={<ArchiveDetail />} />
            <Route path="/archive/:id" element={<ArchiveDetail />} />
            <Route path="/report-damage" element={<ReportDamage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
