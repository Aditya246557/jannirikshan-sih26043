import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const roleAccents = {
    CITIZEN: "#FFD21F",
    ADMIN: "#38BDF8",
    GOVERNMENT: "#38BDF8",
    UNIVERSITY: "#FF4FA3",
    FACULTY: "#34D399",
    STUDENT: "#F59E0B",
    INDUSTRY: "#8B5CF6"
  };

  const accentColor = roleAccents[user.role] || "#FFD21F";

  const roleLinks = {
    CITIZEN: [
      { to: "/citizen", icon: "📊", label: "My Dashboard" },
      { to: "/citizen/report", icon: "📢", label: "Submit Challenge" },
      { to: "/citizen/complaints", icon: "📁", label: "My Submissions" },
      { to: "/explore", icon: "🗺️", label: "Explore Problems" }
    ],
    ADMIN: [
      { to: "/admin", icon: "🏛️", label: "Command Center" },
      { to: "/admin/complaints", icon: "🛡️", label: "Moderation Queue" },
      { to: "/admin/analytics", icon: "📈", label: "National Analytics" },
      { to: "/admin/audit", icon: "📜", label: "Audit Trails" },
      { to: "/explore", icon: "🗺️", label: "All Challenges" }
    ],
    GOVERNMENT: [
      { to: "/admin", icon: "🏛️", label: "Command Center" },
      { to: "/admin/complaints", icon: "🛡️", label: "Problem Operations" },
      { to: "/admin/analytics", icon: "📈", label: "National Analytics" },
      { to: "/explore", icon: "🗺️", label: "All Challenges" }
    ],
    UNIVERSITY: [
      { to: "/university", icon: "🎓", label: "Innovation Cell" },
      { to: "/university/assigned-challenges", icon: "📥", label: "Assigned Problems" },
      { to: "/explore", icon: "🗺️", label: "Browse Challenges" }
    ],
    FACULTY: [
      { to: "/faculty", icon: "👨‍🏫", label: "Mentorship Hub" },
      { to: "/explore", icon: "🗺️", label: "Browse Challenges" }
    ],
    STUDENT: [
      { to: "/student", icon: "🚀", label: "Project Workspace" },
      { to: "/explore", icon: "🗺️", label: "Browse Challenges" }
    ],
    INDUSTRY: [
      { to: "/industry", icon: "🏭", label: "CSR & Sponsorship Hub" },
      { to: "/explore", icon: "🗺️", label: "Browse Challenges" }
    ]
  };

  const links = roleLinks[user.role] || roleLinks.CITIZEN;

  return (
    <aside style={{
      width: "250px",
      background: "#111315",
      borderRight: "1px solid rgba(255, 255, 255, 0.08)",
      minHeight: "calc(100vh - 80px)",
      padding: "24px 16px",
      display: "flex",
      flexDirection: "column",
      gap: "6px"
    }}>
      <div style={{
        fontSize: "10.5px",
        fontWeight: 850,
        color: accentColor,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        padding: "0 12px 12px"
      }}>
        {user.role} WORKSPACE
      </div>
      {links.map((link) => {
        const isActive = location.pathname === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 750,
              color: isActive ? "#F5F5F2" : "#8F9499",
              background: isActive ? "rgba(255, 255, 255, 0.06)" : "transparent",
              border: isActive ? `1px solid ${accentColor}40` : "1px solid transparent",
              transition: "150ms ease"
            }}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        );
      })}
    </aside>
  );
}
