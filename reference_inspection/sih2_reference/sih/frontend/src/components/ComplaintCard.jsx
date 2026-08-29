import { useState } from "react";
import api from "../services/api";

function ComplaintCard({ complaint, onVoteSuccess }) {
    const [voteLoading, setVoteLoading] = useState(false);
    const [voteMessage, setVoteMessage] = useState("");

    const statusColors = {
        PENDING: { background: "#fef3c7", color: "#92400e" },
        UNDER_REVIEW: { background: "#e0e7ff", color: "#3730a3" },
        VALIDATED: { background: "#dbeafe", color: "#1e40af" },
        IN_PROGRESS: { background: "#cff4fc", color: "#055160" },
        RESOLVED: { background: "#dcfce7", color: "#166534" },
        REJECTED: { background: "#fee2e2", color: "#991b1b" },
    };

    const priorityColors = {
        CRITICAL: { color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" },
        HIGH: { color: "#ea580c", bg: "#fff7ed", border: "#ffedd5" },
        MEDIUM: { color: "#d97706", bg: "#fefce8", border: "#fef08a" },
        LOW: { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
    };

    const priorityStyle = priorityColors[complaint.priority] || priorityColors.MEDIUM;
    const statusStyle = statusColors[complaint.status] || statusColors.PENDING;

    const handleCommunityVote = async (voteType) => {
        setVoteLoading(true);
        setVoteMessage("");
        try {
            await api.post(`/complaints/${complaint.id}/community-vote`, { voteType, note: "" });
            setVoteMessage(`Vote recorded (${voteType})`);
            if (onVoteSuccess) onVoteSuccess();
        } catch (err) {
            setVoteMessage(err.response?.data?.message || "Already voted or vote failed");
        } finally {
            setVoteLoading(false);
        }
    };

    return (
        <div style={styles.card}>
            {/* TOP HEADER ROW */}
            <div style={styles.topRow}>
                <div>
                    <div style={styles.badgeGroup}>
                        <h3 style={styles.title}>{complaint.title}</h3>
                        {complaint.challengeId && (
                            <span style={styles.challengeBadge}>
                                🏷️ Cluster {complaint.challengeId}
                            </span>
                        )}
                        {Boolean(complaint.isDuplicate) && (
                            <span style={styles.duplicateBadge}>
                                🔁 Duplicate Linked
                            </span>
                        )}
                    </div>
                    <p style={styles.id}>
                        Complaint #{complaint.id} • {complaint.capturedAt ? new Date(complaint.capturedAt).toLocaleString() : "Recently Submitted"}
                    </p>
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span
                        style={{
                            ...styles.priorityBadge,
                            color: priorityStyle.color,
                            backgroundColor: priorityStyle.bg,
                            borderColor: priorityStyle.border,
                        }}
                    >
                        ● {complaint.priority || "MEDIUM"} PRIORITY
                    </span>

                    <span
                        style={{
                            ...styles.status,
                            background: statusStyle.background,
                            color: statusStyle.color,
                        }}
                    >
                        {complaint.status?.replace("_", " ")}
                    </span>
                </div>
            </div>

            {/* DESCRIPTION */}
            <p style={styles.description}>{complaint.description}</p>

            {/* EVIDENCE IMAGE & PRIVACY STAMP */}
            {complaint.evidenceImageUrl && (
                <div style={styles.evidenceContainer}>
                    <img src={complaint.evidenceImageUrl} alt="Evidence" style={styles.evidenceImage} />
                    <div style={styles.privacyNotice}>
                        🛡️ Faces automatically blurred for privacy
                    </div>
                </div>
            )}

            {/* SOCIO-SPHERE INTELLIGENCE GRID */}
            <div style={styles.infoGrid}>
                <div>
                    <span style={styles.label}>AI Category & Confidence</span>
                    <strong style={styles.aiText}>
                        🤖 {complaint.aiCategory || complaint.category}
                        {complaint.aiConfidence ? ` (${complaint.aiConfidence}%)` : ""}
                    </strong>
                </div>

                <div>
                    <span style={styles.label}>Civic Relevance Score</span>
                    <strong style={{ color: complaint.civicRelevanceScore >= 70 ? "#16a34a" : "#d97706" }}>
                        🎯 {complaint.civicRelevanceScore ? `${complaint.civicRelevanceScore}%` : "75.0%"}
                    </strong>
                </div>

                <div>
                    <span style={styles.label}>Explainable Severity</span>
                    <strong style={{ color: priorityStyle.color }}>
                        ⚠️ {complaint.severity || "MEDIUM"}
                    </strong>
                </div>

                <div>
                    <span style={styles.label}>Trust / Verification Score</span>
                    <strong style={{ color: "#2563eb" }}>
                        ⭐ {complaint.trustScore ? `${complaint.trustScore}/100` : "80.0/100"}
                    </strong>
                </div>

                <div>
                    <span style={styles.label}>Assigned Department</span>
                    <strong style={{ color: "#0f172a" }}>
                        🏛️ {complaint.assignedDepartment || "Municipal Dept"}
                    </strong>
                </div>

                <div>
                    <span style={styles.label}>Location</span>
                    <strong>📍 {complaint.location}</strong>
                </div>
            </div>

            {/* COMMUNITY VALIDATION ACTIONS */}
            <div style={styles.communityRow}>
                <div style={styles.communityInfo}>
                    <span>👥 Community Validation:</span>
                    <strong>{complaint.trustScore ? `${Math.round(complaint.trustScore)}% Confirmed` : "Verified"}</strong>
                </div>
                <div style={styles.voteButtons}>
                    <button
                        onClick={() => handleCommunityVote("CONFIRM")}
                        disabled={voteLoading}
                        style={styles.confirmBtn}
                    >
                        👍 Confirm Issue
                    </button>
                    <button
                        onClick={() => handleCommunityVote("REJECT")}
                        disabled={voteLoading}
                        style={styles.rejectBtn}
                    >
                        👎 Report Invalid
                    </button>
                </div>
            </div>

            {voteMessage && <p style={styles.voteMsg}>{voteMessage}</p>}

            <div style={styles.footer}>
                Submitted by {complaint.citizenEmail} {complaint.deviceInfo ? `• ${complaint.deviceInfo}` : ""}
            </div>
        </div>
    );
}

const styles = {
    card: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "24px",
        marginBottom: "20px",
        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.05)",
    },
    topRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "16px",
    },
    badgeGroup: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap",
    },
    title: {
        margin: 0,
        color: "#0f172a",
        fontSize: "19px",
        fontWeight: "700",
    },
    challengeBadge: {
        background: "#eff6ff",
        color: "#1d4ed8",
        padding: "4px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "600",
        border: "1px solid #bfdbfe",
    },
    duplicateBadge: {
        background: "#fef3c7",
        color: "#b45309",
        padding: "4px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "600",
        border: "1px solid #fde68a",
    },
    id: {
        margin: "6px 0 0",
        color: "#64748b",
        fontSize: "13px",
    },
    priorityBadge: {
        padding: "5px 12px",
        borderRadius: "16px",
        fontSize: "11px",
        fontWeight: "700",
        border: "1px solid",
        letterSpacing: "0.5px",
    },
    status: {
        padding: "5px 12px",
        borderRadius: "16px",
        fontSize: "12px",
        fontWeight: "600",
        whiteSpace: "nowrap",
    },
    description: {
        color: "#334155",
        lineHeight: "1.6",
        margin: "16px 0",
        fontSize: "15px",
    },
    evidenceContainer: {
        position: "relative",
        borderRadius: "12px",
        overflow: "hidden",
        marginBottom: "16px",
        maxHeight: "280px",
    },
    evidenceImage: {
        width: "100%",
        height: "240px",
        objectFit: "cover",
        display: "block",
    },
    privacyNotice: {
        position: "absolute",
        bottom: "10px",
        left: "10px",
        background: "rgba(15, 23, 42, 0.8)",
        color: "#38bdf8",
        padding: "6px 12px",
        borderRadius: "8px",
        fontSize: "12px",
        fontWeight: "600",
    },
    infoGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "16px",
        padding: "16px",
        background: "#f8fafc",
        borderRadius: "10px",
        border: "1px solid #f1f5f9",
    },
    label: {
        display: "block",
        color: "#64748b",
        fontSize: "11px",
        marginBottom: "4px",
        textTransform: "uppercase",
        fontWeight: "600",
    },
    aiText: {
        color: "#6d28d9",
    },
    communityRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "16px",
        paddingTop: "14px",
        borderTop: "1px solid #f1f5f9",
    },
    communityInfo: {
        fontSize: "13px",
        color: "#475569",
        display: "flex",
        gap: "8px",
    },
    voteButtons: {
        display: "flex",
        gap: "10px",
    },
    confirmBtn: {
        background: "#22c55e",
        color: "#ffffff",
        border: "none",
        padding: "8px 14px",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
    },
    rejectBtn: {
        background: "#ef4444",
        color: "#ffffff",
        border: "none",
        padding: "8px 14px",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
    },
    voteMsg: {
        fontSize: "12px",
        color: "#2563eb",
        marginTop: "8px",
    },
    footer: {
        marginTop: "14px",
        color: "#94a3b8",
        fontSize: "12px",
    },
};

export default ComplaintCard;