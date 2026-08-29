import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const PORTALS = [
    { id: "AUTO", label: "Auto-Detect Role", icon: "⚡" },
    { id: "CITIZEN", label: "Citizen", icon: "👤", path: "/dashboard" },
    { id: "OFFICER", label: "Officer", icon: "🏛️", path: "/admin" },
    { id: "UNIVERSITY", label: "University", icon: "🎓", path: "/university" },
    { id: "INDUSTRY", label: "Industry", icon: "🏭", path: "/industry" },
];

function Login() {
    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [selectedPortal, setSelectedPortal] = useState("AUTO");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Login Request
            const loginResponse = await api.post("/auth/login", form);
            const token = loginResponse.data.token;

            // Save JWT
            localStorage.setItem("token", token);

            // Get Current User Profile & Authorities
            const userResponse = await api.get("/user/me");
            const user = userResponse.data;

            console.log("Logged in user:", user);

            // Determine Redirect Destination
            if (selectedPortal !== "AUTO") {
                const target = PORTALS.find((p) => p.id === selectedPortal);
                if (target && target.path) {
                    window.location.href = target.path;
                    return;
                }
            }

            // Auto-detect destination from user authorities
            const isOfficer = user.authorities?.some(
                (a) => a.authority === "ROLE_ADMIN" || a.authority === "ROLE_OFFICER"
            );
            const isUniversity = user.authorities?.some(
                (a) => a.authority === "ROLE_UNIVERSITY"
            );
            const isIndustry = user.authorities?.some(
                (a) => a.authority === "ROLE_INDUSTRY"
            );

            if (isOfficer) {
                window.location.href = "/admin";
            } else if (isUniversity) {
                window.location.href = "/university";
            } else if (isIndustry) {
                window.location.href = "/industry";
            } else {
                window.location.href = "/dashboard";
            }
        } catch (err) {
            console.error("Login error:", err);
            localStorage.removeItem("token");
            if (!err.response) {
                setError("⚠️ Cannot connect to backend server at http://localhost:8080. Please make sure backend is running (./gradlew bootRun).");
            } else {
                setError(err.response?.data?.message || "Invalid email or password. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>SOCIO-SPHERE</h1>
                <p style={styles.subtitle}>Civic Intelligence & Collaborative Governance</p>

                {/* QUICK PORTAL SELECTOR */}
                <div style={styles.portalTabs}>
                    {PORTALS.map((p) => {
                        const isSelected = selectedPortal === p.id;
                        return (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => setSelectedPortal(p.id)}
                                style={isSelected ? { ...styles.portalTab, ...styles.portalTabSelected } : styles.portalTab}
                            >
                                <span>{p.icon}</span> {p.label}
                            </button>
                        );
                    })}
                </div>

                <form onSubmit={handleSubmit}>
                    <label style={styles.label}>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="e.g. user@organization.org"
                        value={form.email}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />

                    <label style={styles.label}>Password</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />

                    {error && (
                        <div style={styles.errorBox}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.button,
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading ? "Logging in..." : "Login to Socio-Sphere"}
                    </button>
                </form>

                <p style={styles.register}>
                    Don't have an account? <Link to="/register" style={styles.link}>Register with Role</Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f1f5f9",
        padding: "30px 16px",
        fontFamily: "sans-serif",
    },

    card: {
        width: "460px",
        maxWidth: "100%",
        padding: "36px",
        background: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        boxSizing: "border-box",
    },

    title: {
        margin: "0 0 6px 0",
        color: "#2563eb",
        fontSize: "30px",
        textAlign: "center",
        fontWeight: "800",
    },

    subtitle: {
        color: "#64748b",
        marginBottom: "20px",
        textAlign: "center",
        fontSize: "14px",
    },

    portalTabs: {
        display: "flex",
        flexWrap: "wrap",
        gap: "6px",
        marginBottom: "20px",
        justifyContent: "center",
    },

    portalTab: {
        padding: "6px 10px",
        borderRadius: "20px",
        border: "1.5px solid #cbd5e1",
        background: "#f8fafc",
        fontSize: "12px",
        fontWeight: "600",
        color: "#475569",
        cursor: "pointer",
        transition: "all 0.2s ease",
        display: "flex",
        alignItems: "center",
        gap: "4px",
    },

    portalTabSelected: {
        background: "#2563eb",
        color: "#ffffff",
        borderColor: "#2563eb",
    },

    label: {
        display: "block",
        fontSize: "13px",
        fontWeight: "600",
        color: "#334155",
        marginBottom: "6px",
    },

    input: {
        width: "100%",
        boxSizing: "border-box",
        padding: "12px 14px",
        marginBottom: "16px",
        border: "1.5px solid #cbd5e1",
        borderRadius: "8px",
        fontSize: "14px",
        background: "#ffffff",
        color: "#0f172a",
        outline: "none",
    },

    button: {
        width: "100%",
        padding: "13px",
        background: "#2563eb",
        color: "#ffffff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "15px",
        fontWeight: "600",
        marginTop: "6px",
    },

    errorBox: {
        background: "#fee2e2",
        border: "1px solid #f87171",
        color: "#b91c1c",
        fontSize: "13px",
        padding: "10px 14px",
        borderRadius: "8px",
        marginBottom: "14px",
        lineHeight: "1.4",
        textAlign: "center",
    },

    register: {
        marginTop: "20px",
        textAlign: "center",
        color: "#64748b",
        fontSize: "14px",
    },

    link: {
        color: "#2563eb",
        fontWeight: "600",
        textDecoration: "none",
    },
};

export default Login;