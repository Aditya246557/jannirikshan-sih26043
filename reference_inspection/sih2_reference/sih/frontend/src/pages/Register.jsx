import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const ROLES = [
    { id: "CITIZEN", label: "Citizen", icon: "👤", desc: "Report & validate local challenges", path: "/dashboard" },
    { id: "OFFICER", label: "Government", icon: "🏛️", desc: "Manage, assign & verify resolutions", path: "/admin" },
    { id: "UNIVERSITY", label: "University", icon: "🎓", desc: "R&D matching & student innovation", path: "/university" },
    { id: "INDUSTRY", label: "Industry / CSR", icon: "🏭", desc: "Sponsor projects & mentor teams", path: "/industry" },
];

function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "CITIZEN",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleRoleSelect = (roleId) => {
        setForm({
            ...form,
            role: roleId,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            console.log("Submitting registration:", form);
            const response = await api.post("/auth/register", form);

            console.log("Registration success:", response.data);

            if (response.data?.token) {
                localStorage.setItem("token", response.data.token);
            }

            // Redirect based on selected role
            const targetRole = ROLES.find((r) => r.id === form.role);
            const redirectPath = targetRole ? targetRole.path : "/dashboard";

            console.log("Redirecting to:", redirectPath);
            window.location.href = redirectPath;
        } catch (err) {
            console.error("Registration error:", err);
            if (!err.response) {
                setError("⚠️ Cannot connect to backend server at http://localhost:8080. Please make sure backend is running (./gradlew bootRun).");
            } else {
                setError(err.response?.data?.message || "Registration failed. Please check your credentials.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>SOCIO-SPHERE</h1>
                <p style={styles.subtitle}>Create your account & select your role</p>

                <form onSubmit={handleSubmit}>
                    {/* ROLE SELECTION CARDS */}
                    <label style={styles.label}>Select Your Stakeholder Role:</label>
                    <div style={styles.roleGrid}>
                        {ROLES.map((r) => {
                            const isSelected = form.role === r.id;
                            return (
                                <div
                                    key={r.id}
                                    onClick={() => handleRoleSelect(r.id)}
                                    style={isSelected ? { ...styles.roleCard, ...styles.roleCardSelected } : styles.roleCard}
                                >
                                    <div style={styles.roleIcon}>{r.icon}</div>
                                    <div style={styles.roleLabel}>{r.label}</div>
                                    <div style={styles.roleDesc}>{r.desc}</div>
                                </div>
                            );
                        })}
                    </div>

                    <label style={styles.label}>Full Name / Organization</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="e.g. John Doe / Tata Tech / JUT Ranchi"
                        value={form.name}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />

                    <label style={styles.label}>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="name@organization.org"
                        value={form.email}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />

                    <label style={styles.label}>Password</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Create a strong password"
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
                        {loading ? "Creating Account..." : `Register as ${ROLES.find(r => r.id === form.role)?.label || "Citizen"}`}
                    </button>
                </form>

                <p style={styles.login}>
                    Already have an account? <Link to="/login" style={styles.link}>Login here</Link>
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
        width: "500px",
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
        marginBottom: "24px",
        textAlign: "center",
        fontSize: "14px",
    },

    label: {
        display: "block",
        fontSize: "13px",
        fontWeight: "600",
        color: "#334155",
        marginBottom: "6px",
    },

    roleGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "10px",
        marginBottom: "20px",
    },

    roleCard: {
        border: "1.5px solid #e2e8f0",
        borderRadius: "10px",
        padding: "12px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        background: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        gap: "2px",
    },

    roleCardSelected: {
        borderColor: "#2563eb",
        background: "#eff6ff",
        boxShadow: "0 0 0 2px rgba(37, 99, 235, 0.2)",
    },

    roleIcon: {
        fontSize: "20px",
        marginBottom: "2px",
    },

    roleLabel: {
        fontWeight: "700",
        fontSize: "13px",
        color: "#0f172a",
    },

    roleDesc: {
        fontSize: "11px",
        color: "#64748b",
        lineHeight: "1.3",
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
    },

    login: {
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

export default Register;