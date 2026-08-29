import React from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/layout/Navbar";

export default function App() {
  const location = useLocation();
  const isPortal =
    location.pathname.startsWith("/citizen") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/university") ||
    location.pathname.startsWith("/faculty") ||
    location.pathname.startsWith("/student") ||
    location.pathname.startsWith("/industry") ||
    location.pathname.startsWith("/government");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#0B0D0F", color: "#F5F5F2" }}>
      {!isPortal && <Navbar />}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <AppRoutes />
      </div>
    </div>
  );
}
