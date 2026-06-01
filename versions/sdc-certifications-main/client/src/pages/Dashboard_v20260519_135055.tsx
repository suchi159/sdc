import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) { navigate("/"); return; }
    const roleMap: Record<string, string> = {
      super_admin: "/admin",
      org_admin: "/org",
      psychometrician: "/psychometrics",
      exam_developer: "/exam-builder",
      instructor: "/instructor",
      proctor: "/proctor",
      candidate: "/candidate",
    };
    const dest = roleMap[user?.role || ""] || "/candidate";
    navigate(dest);
  }, [user, isAuthenticated, loading, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
