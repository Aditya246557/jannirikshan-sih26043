import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import notificationService from "../../services/notificationService";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await notificationService.getMyNotifications(0, 100);
      setItems(Array.isArray(data) ? data : data?.content || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("Unable to load updates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
    } catch (e) {
      console.error("Mark all read error:", e);
    }
  };

  const markSingleRead = async (item) => {
    if (item.isRead || item.read) return;
    try {
      await notificationService.markAsRead(item.id);
      setItems((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true, read: true } : n))
      );
    } catch (e) {}
  };

  const unreadCount = items.filter((n) => !n.isRead && !n.read).length;

  const getTypeStyle = (title = "", msg = "") => {
    const text = `${title} ${msg}`.toLowerCase();
    if (text.includes("resolved") || text.includes("deployed") || text.includes("completed")) {
      return { color: "#A8E063", bg: "rgba(168, 224, 99, 0.12)", border: "#A8E063", icon: "🏆", label: "RESOLVED" };
    }
    if (text.includes("critical") || text.includes("urgent") || text.includes("rejected")) {
      return { color: "#FF5C5C", bg: "rgba(255, 92, 92, 0.12)", border: "#FF5C5C", icon: "⚠️", label: "ALERT" };
    }
    if (text.includes("approved") || text.includes("verified") || text.includes("review")) {
      return { color: "#FFD21F", bg: "rgba(255, 210, 31, 0.12)", border: "#FFD21F", icon: "✓", label: "VERIFICATION" };
    }
    if (text.includes("prototype") || text.includes("testing") || text.includes("deliverable")) {
      return { color: "#38bdf8", bg: "rgba(56, 189, 248, 0.12)", border: "#38bdf8", icon: "🔬", label: "PROTOTYPE" };
    }
    if (text.includes("project") || text.includes("underway") || text.includes("assigned") || text.includes("faculty")) {
      return { color: "#c084fc", bg: "rgba(192, 132, 252, 0.12)", border: "#c084fc", icon: "🏛️", label: "R&D SPRINT" };
    }
    return { color: "#FFD21F", bg: "rgba(255, 210, 31, 0.1)", border: "#FFD21F", icon: "📢", label: "UPDATE" };
  };

  const filteredItems = useMemo(() => {
    return items.filter((n) => {
      const isUnread = !n.isRead && !n.read;
      if (filterType === "UNREAD" && !isUnread) return false;
      if (filterType === "VERIFICATION" && !((n.title + n.message).toLowerCase().includes("verif") || (n.title + n.message).toLowerCase().includes("approv"))) return false;
      if (filterType === "PROJECT" && !((n.title + n.message).toLowerCase().includes("project") || (n.title + n.message).toLowerCase().includes("assign") || (n.title + n.message).toLowerCase().includes("lab"))) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        return (n.title || "").toLowerCase().includes(q) || (n.message || "").toLowerCase().includes(q);
      }
      return true;
    });
  }, [items, filterType, search]);

  const formatTime = (ts) => {
    if (!ts) return "Recently";
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " • " + d.toLocaleDateString();
    } catch {
      return String(ts);
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      
      {/* 1. HERO */}
      <section style={{
        background: "#17191C",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "18px",
        padding: "24px 28px",
        marginBottom: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.35)"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#FFD21F", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              LIVE TELEMETRY STREAM
            </span>
            {unreadCount > 0 && (
              <span style={{ fontSize: "10px", fontWeight: 900, background: "#FFD21F", color: "#0B0D0F", padding: "1px 7px", borderRadius: "999px" }}>
                {unreadCount} Unread
              </span>
            )}
          </div>

          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#F5F5F2", margin: "2px 0 4px", letterSpacing: "-0.02em" }}>
            Updates & Alerts
          </h1>
          <p style={{ fontSize: "13px", color: "#8F9499", margin: 0 }}>
            Stay informed about your civic reports, verification progress, university activity, and community impact.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            style={{
              background: "#1D2023",
              border: "1px solid rgba(255, 210, 31, 0.35)",
              color: "#FFD21F",
              fontSize: "12px",
              padding: "9px 18px",
              borderRadius: "8px",
              fontWeight: 800,
              cursor: "pointer"
            }}
          >
            ✓ Mark All as Read
          </button>
        )}
      </section>

      {/* 2. FILTER & SEARCH CONTROL BAR */}
      <section style={{
        background: "#17191C",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "14px",
        padding: "14px 18px",
        marginBottom: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div style={{ display: "flex", background: "#1D2023", padding: "3px", borderRadius: "8px", gap: "3px" }}>
          {[
            { key: "ALL", label: `All (${items.length})` },
            { key: "UNREAD", label: `Unread (${unreadCount})` },
            { key: "VERIFICATION", label: "Verifications" },
            { key: "PROJECT", label: "R&D Activity" }
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterType(tab.key)}
              style={{
                background: filterType === tab.key ? "#FFD21F" : "transparent",
                color: filterType === tab.key ? "#0B0D0F" : "#8F9499",
                border: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "11.5px",
                fontWeight: filterType === tab.key ? 900 : 600,
                cursor: "pointer"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Filter alerts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "8px 14px",
            background: "#1D2023",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            color: "#F5F5F2",
            fontSize: "12px",
            outline: "none",
            width: "220px"
          }}
        />
      </section>

      {/* 3. CLEAN VERTICAL TIMELINE */}
      {loading ? (
        <div style={{ padding: "60px", textAlign: "center", color: "#8F9499" }}>
          Loading notification feed...
        </div>
      ) : error ? (
        <div style={{ background: "rgba(255, 92, 92, 0.12)", color: "#FF5C5C", padding: "20px", borderRadius: "14px", textAlign: "center" }}>
          {error}
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={{
          background: "#17191C",
          border: "1px dashed rgba(255, 255, 255, 0.12)",
          borderRadius: "18px",
          padding: "60px 20px",
          textAlign: "center"
        }}>
          <span style={{ fontSize: "40px", display: "block", marginBottom: "8px" }}>🔔</span>
          <h3 style={{ fontSize: "16px", color: "#F5F5F2", margin: "0 0 4px", fontWeight: 800 }}>
            No Updates in this Category
          </h3>
          <p style={{ fontSize: "12px", color: "#8F9499", margin: 0 }}>
            You will receive instant alerts as government administrators verify and universities work on your challenges.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredItems.map((n) => {
            const isUnread = !n.isRead && !n.read;
            const style = getTypeStyle(n.title, n.message);

            return (
              <div
                key={n.id}
                onClick={() => markSingleRead(n)}
                style={{
                  background: isUnread ? "#1D2023" : "#17191C",
                  border: isUnread ? `1px solid ${style.border}` : "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "14px",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  position: "relative",
                  boxShadow: isUnread ? `0 0 16px ${style.bg}` : "none",
                  cursor: "pointer",
                  transition: "all 0.18s ease"
                }}
              >
                {/* Left Type Icon Box */}
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: style.bg,
                  color: style.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  flexShrink: 0
                }}>
                  {style.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "9.5px", fontWeight: 900, color: style.color, background: style.bg, padding: "2px 6px", borderRadius: "4px", letterSpacing: "0.05em" }}>
                        {style.label}
                      </span>
                      <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#F5F5F2", margin: 0 }}>
                        {n.title}
                      </h3>
                    </div>

                    <span style={{ fontSize: "11px", color: "#8F9499" }}>
                      {formatTime(n.createdAt)}
                    </span>
                  </div>

                  <p style={{ fontSize: "12.5px", color: "#8F9499", margin: "2px 0 0", lineHeight: 1.4 }}>
                    {n.message}
                  </p>
                </div>

                {/* Unread indicator badge */}
                {isUnread && (
                  <span style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#FFD21F",
                    boxShadow: "0 0 8px #FFD21F",
                    position: "absolute",
                    top: "16px",
                    right: "16px"
                  }} />
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
