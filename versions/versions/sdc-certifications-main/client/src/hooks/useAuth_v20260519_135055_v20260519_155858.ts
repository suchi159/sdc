import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export function useAuth() {
  const [, navigate] = useLocation();
  const { data: user, isLoading, error, refetch } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      navigate("/login");
      // Force page reload to clear all cached state
      window.location.href = "/login";
    },
  });

  return {
    user: user ?? null,
    loading: isLoading,
    error,
    isAuthenticated: !!user,
    logout: () => logoutMutation.mutate(),
    refetch,
  };
}
