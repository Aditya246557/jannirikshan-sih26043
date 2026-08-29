import React, { useEffect, useState } from "react";
import adminService from "../../services/adminService";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadLogs = () => {
    setLoading(true);
    setError("");
    adminService.getAuditLogs(0, 100)
      .then((res) => {
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data?.content)
          ? res.data.content
          : Array.isArray(res?.content)
          ? res.content
          : Array.isArray(res?.data)
          ? res.data
          : [];
        setLogs(list);
      })
      .catch((err) => {
        console.error("Failed to load audit logs:", err);
        setError("Unable to retrieve national audit records.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const getActorName = (l) => {
    if (!l) return "Govt Authority";
    if (typeof l.performedBy === "string") return l.performedBy;
    if (l.performedBy && typeof l.performedBy.name === "string") return l.performedBy.name;
    if (typeof l.performerName === "string") return l.performerName;
    if (typeof l.actorName === "string") return l.actorName;
    return "Govt Authority";
  };

  const getDetails = (l) => {
    if (!l) return "Administrative event logged";
    if (typeof l.details === "string" && l.details.trim()) return l.details;
    if (typeof l.description === "string" && l.description.trim()) return l.description;
    return `System event executed on ${l.entityType || "Entity"} #${l.entityId || "1"}`;
  };

  const getDateStr = (l) => {
    try {
      const d = l?.createdAt || l?.timestamp;
      if (!d) return "Live Event";
      const dateObj = new Date(d);
      return isNaN(dateObj.getTime())
        ? "Live Event"
        : dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " • " + dateObj.toLocaleDateString();
    } catch (e) {
      return "Live Event";
    }
  };

  const safeLogs = Array.isArray(logs) ? logs : [];

  const filtered = safeLogs.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const act = String(l?.action || "").toLowerCase();
    const actor = getActorName(l).toLowerCase();
    const det = getDetails(l).toLowerCase();
    const ent = String(l?.entityType || "").toLowerCase();
    const entId = String(l?.entityId || "");
    return act.includes(q) || actor.includes(q) || det.includes(q) || ent.includes(q) || entId.includes(q);
  });

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* HERO */}
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
        gap: "14px",
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.35)"
      }}>
        <div>
          <span style={{ fontSize: "10px", fontWeight: 800, color: "#38BDF8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            COMPLIANCE & SYSTEM GOVERNANCE
          </span>
          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#F5F5F2", margin: "2px 0 4px", letterSpacing: "-0.02em" }}>
            National Audit Trail ({safeLogs.length} events)
          </h1>
          <p style={{ fontSize: "13px", color: "#8F9499", margin: 0 }}>
            Immutable record of government approvals, university milestone gates, and CSR grant commitments.
          </p>
        </div>

        <button
          onClick={loadLogs}
          style={{
            background: "#1D2023",
            border: "1px solid rgba(56, 189, 248, 0.35)",
            color: "#38BDF8",
            fontSize: "12px",
            padding: "8px 16px",
            borderRadius: "8px",
            fontWeight: 800,
            cursor: "pointer"
          }}
        >
          🔄 Refresh Audit Trail
        </button>
      </section>

      {/* FILTER */}
      <div style={{ marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Search audit trail by user, action, description, or entity ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            background: "#17191C",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            color: "#F5F5F2",
            fontSize: "13px",
            boxSizing: "border-box",
            outline: "none"
          }}
        />
      </div>

      {/* ERROR STATE */}
      {error && (
        <div style={{
          background: "rgba(255, 92, 92, 0.12)",
          border: "1px solid rgba(255, 92, 92, 0.35)",
          borderRadius: "12px",
          padding: "16px 20px",
          color: "#FF7B7B",
          fontSize: "13px",
          marginBottom: "16px"
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* AUDIT TIMELINE */}
      {loading ? (
        <div style={{ padding: "60px", textAlign: "center", color: "#8F9499" }}>
          ⚡ Loading national audit records...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: "#17191C",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px",
          padding: "40px",
          textAlign: "center",
          color: "#8F9499"
        }}>
          <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>📜</span>
          <div style={{ fontSize: "14px", fontWeight: 750, color: "#F5F5F2" }}>No Audit Events Found</div>
          <div style={{ fontSize: "12px", marginTop: "4px" }}>
            {search ? `No events matched "${search}"` : "All platform operations will be logged here."}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map((l, idx) => (
            <div
              key={l?.id || idx}
              style={{
                background: "#17191C",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "14px",
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "14px",
                flexWrap: "wrap"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
                <span style={{ fontSize: "20px" }}>📜</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "10px", fontWeight: 900, background: "rgba(56, 189, 248, 0.15)", color: "#38BDF8", padding: "2px 8px", borderRadius: "4px" }}>
                      {l?.action || "GOV_ACTION"}
                    </span>
                    <span style={{ fontSize: "12.5px", fontWeight: 800, color: "#F5F5F2" }}>
                      {getDetails(l)}
                    </span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#8F9499" }}>
                    Actor: <strong style={{ color: "#F5F5F2" }}>{getActorName(l)}</strong> • Entity: {l?.entityType || "Challenge"} #{l?.entityId || l?.id || "1"}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: "11px", color: "#8F9499", whiteSpace: "nowrap" }}>
                {getDateStr(l)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
