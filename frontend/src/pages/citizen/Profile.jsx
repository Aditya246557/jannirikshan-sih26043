import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import complaintService from "../../services/complaintService";
import impactService from "../../services/impactService";

export default function Profile() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [impact, setImpact] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    complaintService.getMine(0, 100).then((data) => {
      setComplaints(Array.isArray(data) ? data : data?.content || []);
    }).catch(() => {});

    impactService.getSummary().then(setImpact).catch(() => {});
  }, []);

  const totalReported = complaints.length;
  const verifiedCount = complaints.filter((c) => ["UNDER_REVIEW", "ASSIGNED", "IN_PROGRESS", "PROTOTYPE", "RESOLVED"].includes(c.status)).length;
  const solvingCount = complaints.filter((c) => ["ASSIGNED", "IN_PROGRESS", "PROTOTYPE"].includes(c.status)).length;
  const resolvedCount = complaints.filter((c) => ["RESOLVED", "COMPLETED"].includes(c.status)).length;

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* 1. CITIZEN HERO */}
      <section style={{
        background: "#17191C",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "20px",
        padding: "28px 32px",
        marginBottom: "22px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "20px",
        boxShadow: "0 6px 24px rgba(0, 0, 0, 0.35)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div style={{
            width: "68px",
            height: "68px",
            borderRadius: "50%",
            background: "#FFD21F",
            color: "#0B0D0F",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "26px",
            fontWeight: 900,
            boxShadow: "0 0 20px rgba(255, 210, 31, 0.35)"
          }}>
            {(user?.name || "Rahul Sharma").charAt(0).toUpperCase()}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#FFD21F", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                AUTHENTICATED CITIZEN
              </span>
              <span style={{ fontSize: "10px", fontWeight: 800, background: "rgba(168, 224, 99, 0.15)", color: "#A8E063", padding: "2px 8px", borderRadius: "999px" }}>
                ✓ Verified Identity
              </span>
            </div>

            <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#F5F5F2", margin: "2px 0 4px", letterSpacing: "-0.02em" }}>
              {user?.name || "Rahul Sharma"}
            </h1>

            <div style={{ fontSize: "12px", color: "#8F9499" }}>
              {user?.email || "citizen@sih.gov.in"} • Citizen ID: <span style={{ color: "#FFD21F", fontWeight: 700 }}>#CTZ-2026-VARANASI</span>
            </div>
          </div>
        </div>

        <div style={{ background: "#1D2023", padding: "14px 20px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", textAlign: "right" }}>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>COMMUNITY FOOTPRINT</div>
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#A8E063", marginTop: "2px" }}>
            {impact ? Number(impact.totalPeopleBenefited).toLocaleString() : "1,850+"} Citizens Impacted
          </div>
          <div style={{ fontSize: "11px", color: "#FFD21F" }}>Composite Score: {impact?.socialImpactScore || 92}/100</div>
        </div>
      </section>

      {/* 2. FOUR CITIZEN METRIC CARDS */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "22px" }}>
        <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>CHALLENGES REPORTED</span>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#F5F5F2", marginTop: "2px" }}>{totalReported}</div>
          <span style={{ fontSize: "10.5px", color: "#FFD21F" }}>Grassroots Submissions</span>
        </div>

        <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>AUDITED & VERIFIED</span>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#FFD21F", marginTop: "2px" }}>{verifiedCount}</div>
          <span style={{ fontSize: "10.5px", color: "#8F9499" }}>Government Verified</span>
        </div>

        <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>IN UNIVERSITY R&D</span>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#F5F5F2", marginTop: "2px" }}>{solvingCount}</div>
          <span style={{ fontSize: "10.5px", color: "#FFD21F" }}>Active Lab Sprints</span>
        </div>

        <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>SOLUTIONS DEPLOYED</span>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#A8E063", marginTop: "2px" }}>{resolvedCount}</div>
          <span style={{ fontSize: "10.5px", color: "#A8E063" }}>Field Impact Verified</span>
        </div>
      </section>

      {/* 3. PROFILE SETTINGS FORMS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        
        {/* Personal Details */}
        <div style={{
          background: "#17191C",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "18px",
          padding: "24px",
          boxShadow: "0 4px 18px rgba(0, 0, 0, 0.25)"
        }}>
          <h3 style={{ fontSize: "15px", color: "#F5F5F2", margin: "0 0 14px", fontWeight: 800 }}>
            👤 Personal Details
          </h3>

          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 750, color: "#8F9499", display: "block", marginBottom: "4px" }}>
                Full Name
              </label>
              <input
                type="text"
                defaultValue={user?.name || "Rahul Sharma"}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#1D2023",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  color: "#F5F5F2",
                  fontSize: "12.5px",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", fontWeight: 750, color: "#8F9499", display: "block", marginBottom: "4px" }}>
                Email Address (Read-only)
              </label>
              <input
                type="text"
                disabled
                value={user?.email || "citizen@sih.gov.in"}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#121416",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "8px",
                  color: "#8F9499",
                  fontSize: "12.5px",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 750, color: "#8F9499", display: "block", marginBottom: "4px" }}>
                  Primary District
                </label>
                <input
                  type="text"
                  defaultValue="Varanasi"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "#1D2023",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    color: "#F5F5F2",
                    fontSize: "12.5px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 750, color: "#8F9499", display: "block", marginBottom: "4px" }}>
                  State
                </label>
                <input
                  type="text"
                  defaultValue="Uttar Pradesh"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "#1D2023",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    color: "#F5F5F2",
                    fontSize: "12.5px",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                background: "#FFD21F",
                color: "#0B0D0F",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 900,
                cursor: "pointer",
                alignSelf: "flex-start",
                marginTop: "6px"
              }}
            >
              {saved ? "✓ Saved" : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Civic & Notification Preferences */}
        <div style={{
          background: "#17191C",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "18px",
          padding: "24px",
          boxShadow: "0 4px 18px rgba(0, 0, 0, 0.25)"
        }}>
          <h3 style={{ fontSize: "15px", color: "#F5F5F2", margin: "0 0 14px", fontWeight: 800 }}>
            ⚙️ Civic & Alert Preferences
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1D2023", padding: "12px 14px", borderRadius: "10px" }}>
              <div>
                <strong style={{ fontSize: "13px", color: "#F5F5F2", display: "block" }}>R&D Sprint Progress Alerts</strong>
                <span style={{ fontSize: "11px", color: "#8F9499" }}>Receive updates when universities achieve research milestones</span>
              </div>
              <span style={{ color: "#A8E063", fontWeight: 800, fontSize: "12px" }}>ENABLED ✓</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1D2023", padding: "12px 14px", borderRadius: "10px" }}>
              <div>
                <strong style={{ fontSize: "13px", color: "#F5F5F2", display: "block" }}>Government Verification Alerts</strong>
                <span style={{ fontSize: "11px", color: "#8F9499" }}>Instant notification when challenges are approved</span>
              </div>
              <span style={{ color: "#A8E063", fontWeight: 800, fontSize: "12px" }}>ENABLED ✓</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1D2023", padding: "12px 14px", borderRadius: "10px" }}>
              <div>
                <strong style={{ fontSize: "13px", color: "#F5F5F2", display: "block" }}>Quarterly Impact Digest</strong>
                <span style={{ fontSize: "11px", color: "#8F9499" }}>National summary of solved societal problems and funding saved</span>
              </div>
              <span style={{ color: "#FFD21F", fontWeight: 800, fontSize: "12px" }}>SUBSCRIBED</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
