import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import complaintService from "../../services/complaintService";
import ComplaintCard from "../../components/complaint/ComplaintCard";
import ComplaintFilters from "../../components/complaint/ComplaintFilters";
import ComplaintMap from "../../components/map/ComplaintMap";
import { useAuth } from "../../context/AuthContext";

export default function ExploreChallenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [filters, setFilters] = useState({ keyword: "", category: "", district: "", status: "", priority: "" });
  const [viewMode, setViewMode] = useState("both");
  const [loading, setLoading] = useState(true);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const res = await complaintService.explore(filters);
      const list = Array.isArray(res) ? res : res?.content || res?.data?.content || res?.data || [];
      setChallenges(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [filters]);

  const handleClear = () => {
    setFilters({ keyword: "", category: "", district: "", status: "", priority: "" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#07080A", color: "#F5F5F2", fontFamily: "Inter, system-ui, sans-serif" }}>
      
      {/* TOP HEADER */}
      <header style={{
        background: "rgba(17, 19, 21, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        padding: "14px 28px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #FFD21F 0%, #F59E0B 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              boxShadow: "0 0 16px rgba(255, 210, 31, 0.4)"
            }}>
              🌐
            </div>
            <div>
              <span style={{ fontSize: "17px", fontWeight: 900, letterSpacing: "0.03em", color: "#F5F5F2" }}>
                SOCIO-SPHERE
              </span>
              <div style={{ fontSize: "9.5px", fontWeight: 800, color: "#FFD21F", letterSpacing: "0.08em" }}>
                SIH26043 • EXPLORE CHALLENGES MAP
              </div>
            </div>
          </Link>
        </div>

        <nav style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <Link to="/" style={{ color: "#8F9499", textDecoration: "none", fontSize: "13px", fontWeight: 700 }}>
            Home
          </Link>
          {user ? (
            <Link
              to="/citizen"
              style={{
                background: "#FFD21F",
                color: "#0B0D0F",
                padding: "8px 18px",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "12.5px",
                fontWeight: 900,
                boxShadow: "0 0 14px rgba(255, 210, 31, 0.35)"
              }}
            >
              Dashboard →
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  background: "#1D2023",
                  color: "#F5F5F2",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  padding: "8px 18px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "12.5px",
                  fontWeight: 750
                }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                style={{
                  background: "#FFD21F",
                  color: "#0B0D0F",
                  padding: "8px 18px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "12.5px",
                  fontWeight: 900,
                  boxShadow: "0 0 14px rgba(255, 210, 31, 0.35)"
                }}
              >
                Register →
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* MAIN CONTENT AREA */}
      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "30px 24px" }}>
        
        {/* PAGE HERO BANNER */}
        <div style={{
          background: "#111315",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "20px",
          padding: "26px 30px",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "18px"
        }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 850, color: "#FFD21F", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
              <span>🇮🇳</span> NATIONAL SOCIETAL PROBLEM INVENTORY
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#F5F5F2", margin: "0 0 6px" }}>
              Explore Crowdsourced Civic Challenges Across India
            </h1>
            <p style={{ fontSize: "13px", color: "#8F9499", margin: 0, maxWidth: "700px" }}>
              Filter and locate community challenges submitted by citizens nationwide, open for university problem-solving and industry sponsorships.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", background: "#17191C", padding: "4px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <button
              onClick={() => setViewMode("both")}
              style={{
                fontSize: "12px",
                fontWeight: 800,
                padding: "6px 14px",
                borderRadius: "8px",
                border: "none",
                background: viewMode === "both" ? "#FFD21F" : "transparent",
                color: viewMode === "both" ? "#0B0D0F" : "#8F9499",
                cursor: "pointer"
              }}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode("map")}
              style={{
                fontSize: "12px",
                fontWeight: 800,
                padding: "6px 14px",
                borderRadius: "8px",
                border: "none",
                background: viewMode === "map" ? "#FFD21F" : "transparent",
                color: viewMode === "map" ? "#0B0D0F" : "#8F9499",
                cursor: "pointer"
              }}
            >
              🗺️ Map View
            </button>
            <button
              onClick={() => setViewMode("grid")}
              style={{
                fontSize: "12px",
                fontWeight: 800,
                padding: "6px 14px",
                borderRadius: "8px",
                border: "none",
                background: viewMode === "grid" ? "#FFD21F" : "transparent",
                color: viewMode === "grid" ? "#0B0D0F" : "#8F9499",
                cursor: "pointer"
              }}
            >
              📋 Grid View
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <ComplaintFilters filters={filters} onChange={setFilters} onClear={handleClear} />

        {/* MAP SECTION */}
        {(viewMode === "both" || viewMode === "map") && (
          <div style={{
            background: "#111315",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "20px",
            padding: "20px",
            marginBottom: "28px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "14px", fontWeight: 850, color: "#F5F5F2" }}>📍 Interactive GIS Geospatial Heatmap</span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#38BDF8", background: "rgba(56, 189, 248, 0.12)", padding: "2px 8px", borderRadius: "999px" }}>
                  Live Telemetry
                </span>
              </div>
              <span style={{ fontSize: "12px", color: "#8F9499" }}>Showing {challenges.length} active pins</span>
            </div>
            <div style={{ height: "420px", borderRadius: "14px", overflow: "hidden" }}>
              <ComplaintMap challenges={challenges} height="420px" />
            </div>
          </div>
        )}

        {/* REGISTRY SECTION */}
        {(viewMode === "both" || viewMode === "grid") && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "17px", fontWeight: 850, color: "#F5F5F2", margin: 0 }}>
                Challenge Registry ({challenges.length})
              </h2>
            </div>

            {loading ? (
              <div style={{ padding: "60px 20px", textAlign: "center", color: "#8F9499", background: "#111315", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                Filtering challenge registry...
              </div>
            ) : challenges.length === 0 ? (
              <div style={{ padding: "60px 20px", textAlign: "center", background: "#111315", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#8F9499" }}>
                <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>🔍</span>
                <h3 style={{ fontSize: "16px", color: "#F5F5F2", margin: "0 0 6px" }}>No Challenges Match Filters</h3>
                <p style={{ fontSize: "12.5px", margin: 0 }}>Try clearing some criteria or searching for a different keyword.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
                {challenges.map((c) => (
                  <ComplaintCard key={c.id} complaint={c} />
                ))}
              </div>
            )}
          </div>
        )}

      </main>

    </div>
  );
}