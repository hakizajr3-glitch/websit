import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "@/lib/auth";

export default function AuthRoute({ children }: { children: ReactNode }) {
  const user = getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}