import React, { useEffect, useState } from "react";
import adminService from "../../services/adminService";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "Password@123",
    role: "GOVERNMENT"
  });

  useEffect(() => {
    loadUsers();
  }, [role]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers(role);
      const list = Array.isArray(data) ? data : data?.data || data?.content || [];
      setUsers(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await adminService.createUser(form);
      alert("User account registered successfully!");
      setShowAddModal(false);
      loadUsers();
    } catch (err) {
      alert("Failed: " + (err?.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      
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
        gap: "16px",
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.35)"
      }}>
        <div>
          <span style={{ fontSize: "10px", fontWeight: 800, color: "#38BDF8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            INSTITUTIONAL DIRECTORY & RBAC
          </span>
          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#F5F5F2", margin: "2px 0 4px", letterSpacing: "-0.02em" }}>
            Institutional & User Management
          </h1>
          <p style={{ fontSize: "13px", color: "#8F9499", margin: 0 }}>
            Audit active stakeholder personas, university innovation cells, and government authorities.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            background: "#38BDF8",
            color: "#0B0D0F",
            fontSize: "13px",
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: 900,
            cursor: "pointer",
            border: "none",
            boxShadow: "0 0 16px rgba(56, 189, 248, 0.35)"
          }}
        >
          + Add Authority Account
        </button>
      </section>

      {/* FILTER BAR */}
      <section style={{
        background: "#17191C",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "14px",
        padding: "14px 18px",
        marginBottom: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", background: "#1D2023", padding: "3px", borderRadius: "8px", gap: "3px" }}>
          {[
            { key: "", label: "All Roles" },
            { key: "CITIZEN", label: "Citizens" },
            { key: "UNIVERSITY", label: "Universities" },
            { key: "FACULTY", label: "Faculty" },
            { key: "STUDENT", label: "Students" },
            { key: "INDUSTRY", label: "Industry CSR" },
            { key: "ADMIN", label: "Govt Admins" }
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setRole(tab.key)}
              style={{
                background: role === tab.key ? "#38BDF8" : "transparent",
                color: role === tab.key ? "#0B0D0F" : "#8F9499",
                border: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "11.5px",
                fontWeight: role === tab.key ? 900 : 600,
                cursor: "pointer"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* DIRECTORY LIST */}
      {loading ? (
        <div style={{ padding: "60px", textAlign: "center", color: "#8F9499" }}>Loading user directory...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "14px" }}>
          {users.map((u) => (
            <div
              key={u.id}
              style={{
                background: "#17191C",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "16px",
                padding: "18px 20px",
                display: "flex",
                alignItems: "center",
                gap: "14px"
              }}
            >
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "#1D2023",
                color: "#38BDF8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: 900,
                flexShrink: 0
              }}>
                {(u.name || "U").charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                  <span style={{ fontSize: "9.5px", fontWeight: 800, background: "rgba(56,189,248,0.12)", color: "#38BDF8", padding: "2px 6px", borderRadius: "4px" }}>
                    {u.role}
                  </span>
                  <span style={{ fontSize: "10px", color: "#8F9499" }}>ID #{u.id}</span>
                </div>

                <div style={{ fontSize: "14px", fontWeight: 850, color: "#F5F5F2", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {u.name}
                </div>
                <div style={{ fontSize: "11px", color: "#8F9499", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {u.email}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {showAddModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          zIndex: 1100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            background: "#17191C",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "18px",
            maxWidth: "500px",
            width: "100%",
            padding: "24px"
          }}>
            <h3 style={{ fontSize: "16px", color: "#F5F5F2", margin: "0 0 16px", fontWeight: 850 }}>
              + Register Authority Account
            </h3>

            <form onSubmit={handleCreateUser} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                type="text"
                placeholder="Full Name / Institution Name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{ padding: "10px 12px", background: "#1D2023", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#F5F5F2", fontSize: "12.5px" }}
              />
              <input
                type="email"
                placeholder="Official Email Address"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{ padding: "10px 12px", background: "#1D2023", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#F5F5F2", fontSize: "12.5px" }}
              />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                style={{ padding: "10px 12px", background: "#1D2023", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#F5F5F2", fontSize: "12.5px" }}
              >
                <option value="GOVERNMENT">Government Authority (ADMIN)</option>
                <option value="UNIVERSITY">University Innovation Cell</option>
                <option value="FACULTY">Faculty Research Mentor</option>
                <option value="STUDENT">Student Project Lead</option>
                <option value="INDUSTRY">Industry / CSR Partner</option>
              </select>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ background: "#1D2023", border: "none", color: "#8F9499", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" style={{ background: "#38BDF8", color: "#0B0D0F", border: "none", padding: "8px 20px", borderRadius: "6px", fontWeight: 900, cursor: "pointer" }}>
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
