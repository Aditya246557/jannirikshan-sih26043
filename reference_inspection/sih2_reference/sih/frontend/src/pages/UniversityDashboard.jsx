import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function UniversityDashboard() {
    const navigate = useNavigate();

    const [challenges, setChallenges] = useState([]);
    const [adoptedProjects, setAdoptedProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("challenges"); // "challenges" or "projects"

    // Form Modal State for Challenge Adoption
    const [selectedChallenge, setSelectedChallenge] = useState(null);
    const [adoptForm, setAdoptForm] = useState({
        universityName: "Jharkhand University of Technology",
        facultyMentor: "Dr. A. K. Sharma (Dept of Civil & GIS)",
        studentTeamSize: 6,
        domainExpertise: "Civil Engineering + GIS + Hydrology",
        proposalSummary: "Developing IoT-based sensor mesh and automated road drainage monitoring system for challenge cluster.",
    });

    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");

    const getChallengeDefaults = (challenge) => {
        const category = (challenge?.category || "").toLowerCase();

        if (category.includes("tree")) {
            return {
                domainExpertise: "Forestry + Disaster Management + Botany",
                proposalSummary: "Developing a rapid fallen-tree risk assessment, clearance coordination, and road-safety monitoring solution for this challenge cluster.",
            };
        }
        if (category.includes("pothole")) {
            return {
                domainExpertise: "Civil Engineering + GIS + Pavement R&D",
                proposalSummary: "Developing a road-surface inspection and pothole prioritisation solution for this challenge cluster.",
            };
        }
        if (category.includes("garbage") || category.includes("waste")) {
            return {
                domainExpertise: "Environmental Engineering + Recycling Technology",
                proposalSummary: "Developing a waste hotspot monitoring and collection optimisation solution for this challenge cluster.",
            };
        }
        if (category.includes("light") || category.includes("electric")) {
            return {
                domainExpertise: "Electrical Engineering + IoT + Solar R&D",
                proposalSummary: "Developing a smart public-lighting fault detection and maintenance solution for this challenge cluster.",
            };
        }
        return {
            domainExpertise: "Civil Engineering + Urban Planning",
            proposalSummary: "Developing a civic infrastructure solution for this challenge cluster.",
        };
    };

    const openAdoption = (challenge) => {
        const defaults = getChallengeDefaults(challenge);
        setSelectedChallenge(challenge);
        setAdoptForm((current) => ({
            ...current,
            ...defaults,
        }));
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const challengesRes = await api.get("/university/challenges");
            setChallenges(challengesRes.data || []);

            const projectsRes = await api.get("/university/projects");
            setAdoptedProjects(projectsRes.data || []);
        } catch (err) {
            console.error("University fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdoptSubmit = async (e) => {
        e.preventDefault();
        if (!selectedChallenge) return;

        setSubmitting(true);
        setMessage("");
        try {
            await api.post("/university/projects/adopt", {
                challengeId: selectedChallenge.challengeId,
                ...adoptForm,
            });
            setMessage(`Successfully adopted Challenge ${selectedChallenge.challengeId}! Project workspace created.`);
            setSelectedChallenge(null);
            await fetchData();
            setActiveTab("projects");
        } catch (err) {
            setMessage(err.response?.data?.message || "Failed to adopt challenge");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateMilestone = async (projectId, status, prototypeUrl) => {
        try {
            await api.put(`/university/projects/${projectId}/milestone`, { status, prototypeUrl });
            await fetchData();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update milestone");
        }
    };

    return (
        <div style={styles.app}>
            {/* SIDEBAR */}
            <aside style={styles.sidebar}>
                <div style={styles.brand}>
                    <div style={styles.brandIcon}>🎓</div>
                    <div>
                        <div style={styles.brandName}>SOCIO-SPHERE</div>
                        <div style={styles.brandSub}>University R&D Workspace</div>
                    </div>
                </div>

                <div style={styles.sidebarDivider} />

                <nav style={styles.nav}>
                    <button
                        onClick={() => navigate("/dashboard")}
                        style={styles.navItem}
                    >
                        🏠 Citizen Portal
                    </button>
                    <button
                        onClick={() => navigate("/admin")}
                        style={styles.navItem}
                    >
                        🏛️ Government Admin
                    </button>
                    <button
                        onClick={() => setActiveTab("challenges")}
                        style={activeTab === "challenges" ? { ...styles.navItem, ...styles.activeNav } : styles.navItem}
                    >
                        🎯 AI Matched Challenges
                    </button>
                    <button
                        onClick={() => setActiveTab("projects")}
                        style={activeTab === "projects" ? { ...styles.navItem, ...styles.activeNav } : styles.navItem}
                    >
                        🔬 R&D Projects Workspace
                    </button>
                    <button
                        onClick={() => navigate("/industry")}
                        style={styles.navItem}
                    >
                        🏭 Industry Marketplace
                    </button>
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <main style={styles.main}>
                {/* TOP HEADER */}
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.title}>University Innovation & Research Hub</h1>
                        <p style={styles.subtitle}>
                            AI-driven domain matching connecting university student teams & faculty mentors to real-world civic challenges.
                        </p>
                    </div>

                    <div style={styles.univBadge}>
                        🏫 Jharkhand University of Technology
                    </div>
                </header>

                {message && <div style={styles.messageBanner}>{message}</div>}

                {/* TABS */}
                <div style={styles.tabContainer}>
                    <button
                        onClick={() => setActiveTab("challenges")}
                        style={activeTab === "challenges" ? styles.tabActive : styles.tabBtn}
                    >
                        🎯 AI Domain Matched Challenges ({challenges.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("projects")}
                        style={activeTab === "projects" ? styles.tabActive : styles.tabBtn}
                    >
                        🔬 Adopted University Projects ({adoptedProjects.length})
                    </button>
                </div>

                {loading ? (
                    <div style={styles.loading}>Loading AI Matched Challenges...</div>
                ) : activeTab === "challenges" ? (
                    /* CHALLENGES LIST */
                    <div style={styles.grid}>
                        {challenges.map((item) => (
                            <div key={item.challengeId} style={styles.card}>
                                <div style={styles.cardHeader}>
                                    <span style={styles.matchScoreBadge}>
                                        ⚡ {item.matchScore}% Match
                                    </span>
                                    <span style={styles.challengeBadge}>
                                        Cluster {item.challengeId}
                                    </span>
                                </div>

                                <h3 style={styles.cardTitle}>{item.title}</h3>
                                <p style={styles.cardSummary}>{item.summary || "Societal challenge reported across multiple locations."}</p>

                                <div style={styles.metaBox}>
                                    <div><strong>Category:</strong> 🤖 {item.category}</div>
                                    <div><strong>Required Expertise:</strong> 🛠️ {item.requiredExpertise}</div>
                                    <div><strong>Reports Linked:</strong> 📊 {item.reportCount} Reports</div>
                                </div>

                                <div style={styles.cardFooter}>
                                    {item.isAdopted ? (
                                        <span style={styles.adoptedTag}>✅ Adopted by University</span>
                                    ) : (
                                        <button
                                            onClick={() => openAdoption(item)}
                                            style={styles.adoptBtn}
                                        >
                                            🚀 Adopt Challenge for R&D
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* PROJECTS WORKSPACE */
                    <div style={styles.grid}>
                        {adoptedProjects.map((project) => (
                            <div key={project.id} style={styles.projectCard}>
                                <div style={styles.cardHeader}>
                                    <span style={styles.statusBadge}>
                                        ● {project.status.replace("_", " ")}
                                    </span>
                                    <span style={styles.fundingBadge}>
                                        💰 Funding: ₹{project.totalFunding ? project.totalFunding.toLocaleString() : "0"}
                                    </span>
                                </div>

                                <h3 style={styles.cardTitle}>Project #{project.id} — Cluster {project.challengeId}</h3>
                                <p style={styles.proposalText}>"{project.proposalSummary}"</p>

                                <div style={styles.metaBox}>
                                    <div><strong>University:</strong> 🏫 {project.universityName}</div>
                                    <div><strong>Faculty Mentor:</strong> 👨‍🏫 {project.facultyMentor}</div>
                                    <div><strong>Student Team:</strong> 👥 {project.studentTeamSize} Members</div>
                                    <div><strong>Domain:</strong> 🔬 {project.domainExpertise}</div>
                                    {project.prototypeUrl && (
                                        <div><strong>Prototype Link:</strong> <a href={project.prototypeUrl} target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>🔗 View Prototype Docs</a></div>
                                    )}
                                </div>

                                {/* MILESTONE ACTION CONTROLS */}
                                <div style={styles.milestoneBox}>
                                    <span style={styles.milestoneLabel}>Update Milestone Lifecycle:</span>
                                    <div style={styles.milestoneBtns}>
                                        <button
                                            onClick={() => handleUpdateMilestone(project.id, "PROTOTYPE_IN_DEVELOPMENT", project.prototypeUrl || "https://github.com/sih-prototype")}
                                            style={styles.mBtn}
                                        >
                                            ⚙️ Prototype In Dev
                                        </button>
                                        <button
                                            onClick={() => handleUpdateMilestone(project.id, "PILOT_READY", project.prototypeUrl || "https://sih-pilot.demo")}
                                            style={styles.mBtn}
                                        >
                                            🧪 Ready for Pilot
                                        </button>
                                        <button
                                            onClick={() => handleUpdateMilestone(project.id, "DEPLOYED", project.prototypeUrl)}
                                            style={{ ...styles.mBtn, background: "#16a34a", color: "#fff" }}
                                        >
                                            🚀 Deployed Solution
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ADOPT CHALLENGE MODAL */}
                {selectedChallenge && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modal}>
                            <h2>Adopt Challenge {selectedChallenge.challengeId}</h2>
                            <p style={{ color: "#64748b", marginBottom: "16px" }}>{selectedChallenge.title}</p>

                            <form onSubmit={handleAdoptSubmit}>
                                <label style={styles.inputLabel}>University Name</label>
                                <input
                                    type="text"
                                    value={adoptForm.universityName}
                                    onChange={(e) => setAdoptForm({ ...adoptForm, universityName: e.target.value })}
                                    required
                                    style={styles.modalInput}
                                />

                                <label style={styles.inputLabel}>Lead Faculty Mentor</label>
                                <input
                                    type="text"
                                    value={adoptForm.facultyMentor}
                                    onChange={(e) => setAdoptForm({ ...adoptForm, facultyMentor: e.target.value })}
                                    required
                                    style={styles.modalInput}
                                />

                                <label style={styles.inputLabel}>Student Team Size</label>
                                <input
                                    type="number"
                                    value={adoptForm.studentTeamSize}
                                    onChange={(e) => setAdoptForm({ ...adoptForm, studentTeamSize: Number(e.target.value) })}
                                    required
                                    style={styles.modalInput}
                                />

                                <label style={styles.inputLabel}>Domain Expertise</label>
                                <input
                                    type="text"
                                    value={adoptForm.domainExpertise}
                                    onChange={(e) => setAdoptForm({ ...adoptForm, domainExpertise: e.target.value })}
                                    required
                                    style={styles.modalInput}
                                />

                                <label style={styles.inputLabel}>R&D Proposal Summary</label>
                                <textarea
                                    value={adoptForm.proposalSummary}
                                    onChange={(e) => setAdoptForm({ ...adoptForm, proposalSummary: e.target.value })}
                                    rows={3}
                                    required
                                    style={styles.modalTextarea}
                                />

                                <div style={styles.modalActions}>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedChallenge(null)}
                                        style={styles.cancelBtn}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        style={styles.submitModalBtn}
                                    >
                                        {submitting ? "Submitting..." : "Confirm & Adopt Challenge"}
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
    univBadge: { background: "#e0e7ff", color: "#3730a3", padding: "10px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "700" },
    messageBanner: { padding: "14px", background: "#dcfce7", color: "#166534", borderRadius: "10px", marginBottom: "20px", fontWeight: "600" },
    tabContainer: { display: "flex", gap: "12px", marginBottom: "24px" },
    tabBtn: { padding: "12px 20px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "600", color: "#475569" },
    tabActive: { padding: "12px 20px", background: "#2563eb", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "600", color: "#ffffff" },
    loading: { padding: "40px", textAlign: "center", color: "#64748b" },
    grid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" },
    card: { background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.04)" },
    projectCard: { background: "#ffffff", border: "1px solid #38bdf8", borderRadius: "14px", padding: "24px", boxShadow: "0 4px 12px rgba(56,189,248,0.1)" },
    cardHeader: { display: "flex", justifyContent: "space-between", marginBottom: "14px" },
    matchScoreBadge: { background: "#dcfce7", color: "#15803d", padding: "6px 12px", borderRadius: "16px", fontSize: "13px", fontWeight: "700" },
    challengeBadge: { background: "#eff6ff", color: "#1d4ed8", padding: "6px 12px", borderRadius: "16px", fontSize: "12px", fontWeight: "600" },
    statusBadge: { background: "#e0e7ff", color: "#4338ca", padding: "6px 12px", borderRadius: "16px", fontSize: "12px", fontWeight: "700" },
    fundingBadge: { background: "#fef3c7", color: "#b45309", padding: "6px 12px", borderRadius: "16px", fontSize: "12px", fontWeight: "700" },
    cardTitle: { margin: "0 0 10px 0", fontSize: "18px", color: "#0f172a" },
    cardSummary: { color: "#475569", fontSize: "14px", lineHeight: "1.5", marginBottom: "16px" },
    proposalText: { color: "#334155", fontStyle: "italic", fontSize: "14px", marginBottom: "16px", background: "#f8fafc", padding: "12px", borderRadius: "8px" },
    metaBox: { background: "#f8fafc", padding: "14px", borderRadius: "10px", fontSize: "13px", display: "grid", gap: "8px", marginBottom: "16px" },
    cardFooter: { display: "flex", justifyContent: "flex-end" },
    adoptBtn: { background: "#2563eb", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
    adoptedTag: { color: "#16a34a", fontWeight: "700", fontSize: "13px" },
    milestoneBox: { paddingTop: "14px", borderTop: "1px solid #f1f5f9" },
    milestoneLabel: { display: "block", fontSize: "12px", color: "#64748b", marginBottom: "8px", fontWeight: "600" },
    milestoneBtns: { display: "flex", gap: "8px" },
    mBtn: { background: "#2563eb", color: "#ffffff", border: "1px solid #2563eb", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
    modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
    modal: { background: "#fff", borderRadius: "16px", padding: "32px", width: "520px", maxHeight: "90vh", overflowY: "auto" },
    inputLabel: { display: "block", fontSize: "13px", color: "#475569", marginBottom: "6px", fontWeight: "600" },
    modalInput: { width: "100%", padding: "10px", marginBottom: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" },
    modalTextarea: { width: "100%", padding: "10px", marginBottom: "18px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" },
    modalActions: { display: "flex", justifyContent: "flex-end", gap: "12px" },
    cancelBtn: { padding: "10px 18px", background: "#f1f5f9", border: "none", borderRadius: "8px", cursor: "pointer" },
    submitModalBtn: { padding: "10px 18px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
};

export default UniversityDashboard;
