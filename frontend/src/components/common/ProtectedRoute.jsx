import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function ProtectedRoute({ role, allowedRoles }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B0D0F", color: "#38BDF8", fontFamily: "Inter, system-ui, sans-serif", fontSize: "14px", fontWeight: 700 }}>
                ⚡ Verifying Command Center Access...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const currentRole = String(user?.role || user?.data?.role || "").toUpperCase();
    const isAdminOrGovt = currentRole === "ADMIN" || currentRole === "GOVERNMENT" || currentRole === "ROLE_ADMIN" || currentRole === "ROLE_GOVERNMENT";

    if (role) {
        const reqRole = String(role).toUpperCase();
        if (currentRole !== reqRole && !isAdminOrGovt) {
            return <Navigate to="/" replace />;
        }
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const normalized = allowedRoles.map((r) => String(r).toUpperCase());
        const hasRole = normalized.includes(currentRole);
        if (!hasRole && !isAdminOrGovt) {
            return <Navigate to="/" replace />;
        }
    }

    return <Outlet />;
}