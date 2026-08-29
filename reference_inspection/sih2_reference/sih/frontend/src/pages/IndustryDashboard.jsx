import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function IndustryDashboard() {
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [sponsorships, setSponsorships] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedProject, setSelectedProject] = useState(null);
    const [sponsorForm, setSponsorForm] = useState({
        companyName: "Tata Tech CSR Foundation",
        supportType: "CSR_GRANT",
        grantAmount: 50000,
        notes: "Providing CSR grant and hardware sensors for university R&D prototype deployment.",
    });

    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const projectsRes = await api.get("/university/projects");
            setProjects(projectsRes.data || []);

            const sponsorshipsRes = await api.get("/industry/sponsorships");
            setSponsorships(sponsorshipsRes.data || []);
        } catch (err) {
            console.error("Industry fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSponsorSubmit = async (e) => {
        e.preventDefault();
        if (!selectedProject) return;

        setSubmitting(true);
        setMessage("");
        try {
            await api.post("/industry/sponsor", {
                projectId: selectedProject.id,
                challengeId: selectedProject.challengeId,
                ...sponsorForm,
            });
            setMessage(`Successfully sponsored Project #${selectedProject.id} with ₹${Number(sponsorForm.grantAmount).toLocaleString()}!`);
            setSelectedProject(null);
            await fetchData();
        } catch (err) {
            setMessage(err.response?.data?.message || "Sponsorship failed");
        } finally {
            setSubmitting(false);
        }
    };

    const totalCSRGrant = sponsorships.reduce((sum, item) => sum + (item.grantAmount || 0), 0);

    return (
        <div style={styles.app}>
            {/* SIDEBAR */}
            <aside style={styles.sidebar}>
                <div style={styles.brand}>
                    <div style={styles.brandIcon}>🏭</div>
                    <div>
                        <div style={styles.brandName}>SOCIO-SPHERE</div>
                        <div style={styles.brandSub}>Industry & CSR Portal</div>
                    </div>
                </div>

                <div style={styles.sidebarDivider} />

                <nav style={styles.nav}>
                    <button onClick={() => navigate("/dashboard")} style={styles.navItem}>
                        🏠 Citizen Portal
                    </button>
                    <button onClick={() => navigate("/admin")} style={styles.navItem}>
                        🏛️ Government Admin
                    </button>
                    <button onClick={() => navigate("/university")} style={styles.navItem}>
                        🎓 University Workspace
                    </button>
                    <button style={{ ...styles.navItem, ...styles.activeNav }}>
                        🏭 Industry Marketplace
                    </button>
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <main style={styles.main}>
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Industry Collaboration & CSR Marketplace</h1>
                        <p style={styles.subtitle}>
                            Discover university R&D prototypes, sponsor high-impact societal projects, provide tech grants, and mentor student innovation.
                        </p>
                    </div>

                    <div style={styles.statsBadge}>
                        💼 Total CSR Mobilized: ₹{totalCSRGrant.toLocaleString()}
                    </div>
                </header>

                {message && <div style={styles.messageBanner}>{message}</div>}

                {loading ? (
                    <div style={styles.loading}>Loading University Projects...</div>
                ) : (
                    <div style={styles.grid}>
                        {projects.map((project) => (
                            <div key={project.id} style={styles.card}>
                                <div style={styles.cardHeader}>
                                    <span style={styles.univTag}>
                                        🏫 {project.universityName}
                                    </span>
                                    <span style={styles.statusTag}>
                                        ● {project.status.replace("_", " ")}
                                    </span>
                                </div>

                                <h3 style={styles.cardTitle}>Project #{project.id} — Cluster {project.challengeId}</h3>
                                <p style={styles.proposalText}>"{project.proposalSummary}"</p>

                                <div style={styles.metaBox}>
                                    <div><strong>Faculty Mentor:</strong> 👨‍🏫 {project.facultyMentor}</div>
                                    <div><strong>Student Team:</strong> 👥 {project.studentTeamSize} Members</div>
                                    <div><strong>Domain R&D:</strong> 🔬 {project.domainExpertise}</div>
                                    <div><strong>Current Funding Received:</strong> 💰 ₹{project.totalFunding ? project.totalFunding.toLocaleString() : "0"}</div>
                                    {project.prototypeUrl && (
                                        <div><strong>Prototype Link:</strong> <a href={project.prototypeUrl} target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>🔗 Technical Docs</a></div>
                                    )}
                                </div>

                                <div style={styles.cardFooter}>
                                    <button
                                        onClick={() => setSelectedProject(project)}
                                        style={styles.sponsorBtn}
                                    >
                                        🤝 Sponsor Project / Provide CSR Grant
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* SPONSOR MODAL */}
                {selectedProject && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modal}>
                            <h2>Sponsor Project #{selectedProject.id} (Cluster {selectedProject.challengeId})</h2>
                            <p style={{ color: "#64748b", marginBottom: "16px" }}>{selectedProject.universityName}</p>

                            <form onSubmit={handleSponsorSubmit}>
                                <label style={styles.inputLabel}>Company / CSR Entity Name</label>
                                <input
                                    type="text"
                                    value={sponsorForm.companyName}
                                    onChange={(e) => setSponsorForm({ ...sponsorForm, companyName: e.target.value })}
                                    required
                                    style={styles.modalInput}
                                />

                                <label style={styles.inputLabel}>Support Type</label>
                                <select
                                    value={sponsorForm.supportType}
                                    onChange={(e) => setSponsorForm({ ...sponsorForm, supportType: e.target.value })}
                                    style={styles.modalInput}
                                >
                                    <option value="CSR_GRANT">💰 CSR Financial Grant</option>
                                    <option value="MENTORSHIP">👨‍💼 Executive Mentorship</option>
                                    <option value="PILOT_PARTNER">🧪 Pilot Testing Partner</option>
                                </select>

                                <label style={styles.inputLabel}>CSR Grant Amount (INR)</label>
                                <input
                                    type="number"
                                    value={sponsorForm.grantAmount}
                                    onChange={(e) => setSponsorForm({ ...sponsorForm, grantAmount: Number(e.target.value) })}
                                    style={styles.modalInput}
                                />

                                <label style={styles.inputLabel}>Sponsorship Notes / Partnership Offer</label>
                                <textarea
                                    value={sponsorForm.notes}
                                    onChange={(e) => setSponsorForm({ ...sponsorForm, notes: e.target.value })}
                                    rows={3}
                                    style={styles.modalTextarea}
                                />

                                <div style={styles.modalActions}>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedProject(null)}
                                        style={styles.cancelBtn}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        style={styles.submitModalBtn}
                                    >
                                        {submitting ? "Processing..." : "Confirm Sponsorship"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

const styles = {
    app: { display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "sans-serif" },
    sidebar: { width: "260px", background: "#0f172a", color: "#fff", padding: "24px 16px", display: "flex", flexDirection: "column" },
    brand: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" },
    brandIcon: { fontSize: "28px" },
    brandName: { fontSize: "18px", fontWeight: "700", color: "#38bdf8" },
    brandSub: { fontSize: "12px", color: "#94a3b8" },
    sidebarDivider: { height: "1px", background: "#1e293b", margin: "16px 0" },
    nav: { display: "flex", flexDirection: "column", gap: "10px" },
    navItem: { background: "transparent", border: "none", color: "#94a3b8", textAlign: "left", padding: "12px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600" },
    activeNav: { background: "#1e293b", color: "#38bdf8" },
    main: { flex: 1, padding: "32px 40px", overflowY: "auto" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" },
    title: { margin: 0, fontSize: "28px", color: "#0f172a" },
    subtitle: { margin: "8px 0 0", color: "#64748b", fontSize: "14px" },
    statsBadge: { background: "#fef3c7", color: "#b45309", padding: "10px 16px", borderRadius: "20px", fontSize: "14px", fontWeight: "700" },
    messageBanner: { padding: "14px", background: "#dcfce7", color: "#166534", borderRadius: "10px", marginBottom: "20px", fontWeight: "600" },
    loading: { padding: "40px", textAlign: "center", color: "#64748b" },
    grid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" },
    card: { background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.04)" },
    cardHeader: { display: "flex", justifyContent: "space-between", marginBottom: "14px" },
    univTag: { background: "#e0e7ff", color: "#3730a3", padding: "6px 12px", borderRadius: "16px", fontSize: "12px", fontWeight: "700" },
    statusTag: { background: "#dcfce7", color: "#15803d", padding: "6px 12px", borderRadius: "16px", fontSize: "12px", fontWeight: "700" },
    cardTitle: { margin: "0 0 10px 0", fontSize: "18px", color: "#0f172a" },
    proposalText: { color: "#334155", fontStyle: "italic", fontSize: "14px", marginBottom: "16px", background: "#f8fafc", padding: "12px", borderRadius: "8px" },
    metaBox: { background: "#f8fafc", padding: "14px", borderRadius: "10px", fontSize: "13px", display: "grid", gap: "8px", marginBottom: "16px" },
    cardFooter: { display: "flex", justifyContent: "flex-end" },
    sponsorBtn: { background: "#16a34a", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
    modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
    modal: { background: "#fff", borderRadius: "16px", padding: "32px", width: "520px", maxHeight: "90vh", overflowY: "auto" },
    inputLabel: { display: "block", fontSize: "13px", color: "#475569", marginBottom: "6px", fontWeight: "600" },
    modalInput: { width: "100%", padding: "10px", marginBottom: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" },
    modalTextarea: { width: "100%", padding: "10px", marginBottom: "18px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" },
    modalActions: { display: "flex", justifyContent: "flex-end", gap: "12px" },
    cancelBtn: { padding: "10px 18px", background: "#f1f5f9", border: "none", borderRadius: "8px", cursor: "pointer" },
    submitModalBtn: { padding: "10px 18px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
};

export default IndustryDashboard;
