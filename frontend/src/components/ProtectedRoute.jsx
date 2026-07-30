import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { base44 } from "@/base44";

export default function ProtectedRoute() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.getSession().then(session => {
      setUser(session);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}
