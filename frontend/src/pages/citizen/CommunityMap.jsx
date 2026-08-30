import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { createPinIcon, createUserLocationIcon, MAP_PRIORITY_COLORS } from "../../components/map/mapMarkerUtils";
import "leaflet/dist/leaflet.css";
import complaintService from "../../services/complaintService";

const DEFAULT_CENTER = [20.5937, 78.9629];

const PRIORITY_COLORS = MAP_PRIORITY_COLORS;

function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || map.getZoom(), { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function CommunityMap() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Geolocation state
  const [userLocation, setUserLocation] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoMessage, setGeoMessage] = useState("");
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(5);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await complaintService.search({ page: 0, size: 150 });
      const list = Array.isArray(data) ? data : data?.content || [];
      setComplaints(list);
      const valid = list.filter((c) => c && c.latitude != null && c.longitude != null && !isNaN(Number(c.latitude)) && !isNaN(Number(c.longitude)));
      if (valid.length > 0) {
        setMapCenter([Number(valid[0].latitude), Number(valid[0].longitude)]);
        setMapZoom(12);
      }
    } catch (err) {
      console.error("Map load error:", err);
      setError("Failed to load map data.");
    } finally {
      setLoading(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoMessage("Geolocation is not supported by your browser.");
      return;
    }

    setGeoLoading(true);
    setGeoMessage("");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setUserLocation([lat, lng]);
        setMapCenter([lat, lng]);
        setMapZoom(14);
        setGeoMessage("✓ Location Acquired: Showing your current position");
      },
      (err) => {
        setGeoLoading(false);
        setGeoMessage("Unable to access location. Please allow browser location permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      if (!c || c.latitude == null || c.longitude == null || isNaN(Number(c.latitude)) || isNaN(Number(c.longitude))) return false;
      if (selectedPriority !== "ALL" && c.priority !== selectedPriority) return false;
      if (selectedCategory !== "ALL" && c.category !== selectedCategory) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = (c.title || "").toLowerCase().includes(q);
        const matchLoc = (c.district || "").toLowerCase().includes(q) || (c.address || "").toLowerCase().includes(q);
        if (!matchTitle && !matchLoc) return false;
      }
      return true;
    });
  }, [complaints, selectedPriority, selectedCategory, search]);

  const categories = useMemo(() => {
    const s = new Set();
    complaints.forEach((c) => {
      if (c.category) s.add(c.category);
    });
    return Array.from(s);
  }, [complaints]);

  // Priority counts
  const critCount = complaints.filter((c) => c.priority === "CRITICAL" && c.latitude && c.longitude).length;
  const highCount = complaints.filter((c) => c.priority === "HIGH" && c.latitude && c.longitude).length;
  const medCount = complaints.filter((c) => c.priority === "MEDIUM" && c.latitude && c.longitude).length;
  const lowCount = complaints.filter((c) => c.priority === "LOW" && c.latitude && c.longitude).length;

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      
      {/* 1. TOP HEADER & HERO */}
      <section style={{
        background: "#17191C",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "18px",
        padding: "22px 28px",
        marginBottom: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.35)"
      }}>
        <div>
          <span style={{ fontSize: "10px", fontWeight: 800, color: "#FFD21F", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            GIS COLLABORATIVE REPOSITORY
          </span>
          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#F5F5F2", margin: "2px 0 4px", letterSpacing: "-0.02em" }}>
            Community Impact Map
          </h1>
          <p style={{ fontSize: "13px", color: "#8F9499", margin: 0 }}>
            Geotagged societal challenges awaiting verification and engineering research across districts.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={geoLoading}
            style={{
              background: "#FFD21F",
              color: "#0B0D0F",
              border: "none",
              padding: "10px 20px",
              borderRadius: "10px",
              fontSize: "12.5px",
              fontWeight: 900,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 0 16px rgba(255, 210, 31, 0.3)"
            }}
          >
            {geoLoading ? "⏳ Locating..." : "📍 Use My Location"}
          </button>

          <Link
            to="/citizen/report"
            style={{
              background: "#1D2023",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#F5F5F2",
              padding: "10px 18px",
              borderRadius: "10px",
              fontSize: "12.5px",
              fontWeight: 750,
              textDecoration: "none"
            }}
          >
            + Report Challenge
          </Link>
        </div>
      </section>

      {geoMessage && (
        <div style={{
          background: geoMessage.includes("✓") ? "rgba(168, 224, 99, 0.12)" : "rgba(255, 92, 92, 0.12)",
          border: geoMessage.includes("✓") ? "1px solid rgba(168, 224, 99, 0.3)" : "1px solid rgba(255, 92, 92, 0.3)",
          color: geoMessage.includes("✓") ? "#A8E063" : "#FF5C5C",
          padding: "10px 16px",
          borderRadius: "10px",
          marginBottom: "16px",
          fontSize: "12px",
          fontWeight: 700
        }}>
          {geoMessage}
        </div>
      )}

      {/* 2. MAIN MAP WORKSPACE (2-COLUMN: CONTROLS + FULL MAP) */}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "20px", alignItems: "start" }}>
        
        {/* Left Filter & Telemetry Drawer */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* Filter Card */}
          <div style={{
            background: "#17191C",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "18px",
            padding: "20px",
            boxShadow: "0 4px 18px rgba(0, 0, 0, 0.25)"
          }}>
            <h3 style={{ fontSize: "14px", color: "#F5F5F2", margin: "0 0 14px", fontWeight: 800 }}>
              🔍 Search & Filter Pins
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                type="text"
                placeholder="Search location or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: "9px 12px",
                  background: "#1D2023",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  color: "#F5F5F2",
                  fontSize: "12px",
                  outline: "none"
                }}
              />

              <div>
                <label style={{ fontSize: "11px", fontWeight: 750, color: "#8F9499", display: "block", marginBottom: "4px" }}>
                  Priority Filter
                </label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    background: "#1D2023",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    color: "#F5F5F2",
                    fontSize: "12px",
                    outline: "none"
                  }}
                >
                  <option value="ALL">All Priorities ({complaints.length})</option>
                  <option value="CRITICAL">🔴 Critical ({critCount})</option>
                  <option value="HIGH">🟡 High ({highCount})</option>
                  <option value="MEDIUM">🟠 Medium ({medCount})</option>
                  <option value="LOW">🟢 Low ({lowCount})</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 750, color: "#8F9499", display: "block", marginBottom: "4px" }}>
                  Domain Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    background: "#1D2023",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    color: "#F5F5F2",
                    fontSize: "12px",
                    outline: "none"
                  }}
                >
                  <option value="ALL">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Map Priority Legend Card */}
          <div style={{
            background: "#17191C",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "18px",
            padding: "18px 20px",
            boxShadow: "0 4px 18px rgba(0, 0, 0, 0.25)"
          }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase", marginBottom: "10px" }}>
              PRIORITY MARKER LEGEND
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11.5px" }}>
                <span style={{ color: "#FF5C5C", fontWeight: 800 }}>● CRITICAL SEVERITY</span>
                <strong style={{ color: "#F5F5F2" }}>{critCount} pins</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11.5px" }}>
                <span style={{ color: "#FFD21F", fontWeight: 800 }}>● HIGH PRIORITY</span>
                <strong style={{ color: "#F5F5F2" }}>{highCount} pins</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11.5px" }}>
                <span style={{ color: "#F5C400", fontWeight: 800 }}>● MEDIUM PRIORITY</span>
                <strong style={{ color: "#F5F5F2" }}>{medCount} pins</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11.5px" }}>
                <span style={{ color: "#A8E063", fontWeight: 800 }}>● LOW PRIORITY</span>
                <strong style={{ color: "#F5F5F2" }}>{lowCount} pins</strong>
              </div>

              {userLocation && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#38bdf8", fontWeight: 800 }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#38bdf8", boxShadow: "0 0 10px #38bdf8" }} />
                  YOU ARE HERE
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Full Leaflet Map Canvas */}
        <div style={{
          background: "#17191C",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "20px",
          padding: "16px",
          boxShadow: "0 6px 24px rgba(0, 0, 0, 0.35)",
          position: "relative"
        }}>
          <div style={{ height: "600px", width: "100%", borderRadius: "14px", overflow: "hidden", position: "relative" }}>
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              scrollWheelZoom={true}
              style={{ width: "100%", height: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapRecenter center={mapCenter} zoom={mapZoom} />

              {/* User Current Location Pulsing Pin */}
              {userLocation && (
                <Marker position={userLocation} icon={createUserLocationIcon(28)}>
                  <Popup>
                    <div style={{ color: "#F5F5F2", background: "#17191C", padding: "8px 10px", fontSize: "12px", fontWeight: 800, borderRadius: "6px" }}>
                      <div style={{ color: "#38bdf8", marginBottom: "3px" }}>📍 YOU ARE HERE</div>
                      <div style={{ fontSize: "10.5px", color: "#8F9499" }}>
                        Lat: {userLocation[0]}, Lng: {userLocation[1]}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Priority Markers */}
              {filtered.map((c) => {
                const color = PRIORITY_COLORS[c.priority] || PRIORITY_COLORS.HIGH;
                const lat = Number(c.latitude);
                const lng = Number(c.longitude);

                return (
                  <Marker
                    key={c.id}
                    position={[lat, lng]}
                    icon={createPinIcon(color, 28)}
                  >
                    <Popup>
                      <div style={{ color: "#F5F5F2", background: "#17191C", padding: "10px", fontSize: "12px", minWidth: "220px", borderRadius: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                          <span style={{ fontSize: "9px", fontWeight: 800, background: "#1D2023", color: color, padding: "2px 6px", borderRadius: "4px", border: `1px solid ${color}40` }}>
                            ● {c.priority} SEVERITY
                          </span>
                          <span style={{ fontSize: "9.5px", color: "#8F9499" }}>ID #{c.id}</span>
                        </div>

                        <strong style={{ display: "block", fontSize: "13.5px", color: "#F5F5F2", margin: "4px 0", fontWeight: 850, lineHeight: 1.3 }}>
                          {c.title}
                        </strong>

                        <div style={{ color: "#B7BCC2", fontSize: "11px", marginBottom: "2px" }}>
                          {c.category} • {c.district || "Local Ward"}
                        </div>

                        <div style={{ color: "#38BDF8", fontWeight: 800, fontSize: "11px", marginBottom: "8px" }}>
                          Status: {c.status}
                        </div>

                        <Link
                          to={`/citizen/complaints/${c.id}`}
                          style={{
                            display: "inline-block",
                            background: "#FFD21F",
                            color: "#0B0D0F",
                            padding: "5px 12px",
                            borderRadius: "6px",
                            textDecoration: "none",
                            fontSize: "11px",
                            fontWeight: 850
                          }}
                        >
                          View Details →
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", fontSize: "11px", color: "#8F9499" }}>
            <span>Showing {filtered.length} active geotagged pins</span>
            <span>💡 Click any marker to view details & research stage</span>
          </div>
        </div>

      </div>

    </div>
  );
}
