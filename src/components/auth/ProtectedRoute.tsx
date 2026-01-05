import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: ("super_admin" | "garage")[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, isLoading } = useAuth();

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Only redirect to login if there's no user AND we're done loading
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Wait for role to be fetched before checking permissions
  // If role is null but user exists, we're still fetching the role
  if (role === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if user has the required role
  if (!allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on role
    if (role === "super_admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (role === "garage") {
      return <Navigate to="/garage/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
