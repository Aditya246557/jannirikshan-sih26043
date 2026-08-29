import React, { useState } from "react";
import milestoneService from "../../services/milestoneService";

export default function MilestoneTimeline({ milestones = [], isFaculty = false, onUpdated }) {
    const [reviewModal, setReviewModal] = useState(null);
    const [feedback, setFeedback] = useState("");

    const handleReview = async (approved) => {
        if (!reviewModal) return;
        try {
            await milestoneService.review(reviewModal.id, approved, feedback);
            alert("Milestone " + (approved ? "approved!" : "sent back with feedback."));
            setReviewModal(null);
            setFeedback("");
            if (onUpdated) onUpdated();
        } catch (e) {
            alert("Review failed: " + e.message);
        }
    };

    return (
        <div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {milestones.map((m, idx) => (
                    <div
                        key={m.id}
                        style={{
                            border: "1px solid var(--ss-border)",
                            borderRadius: "14px",
                            padding: "16px",
                            background: m.status === "APPROVED" ? "#f0fdf4" : m.status === "IN_PROGRESS" ? "#f0f9ff" : "#fff",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                    >
                        <div style={{ maxWidth: "70%" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{
                                    width: "24px",
                                    height: "24px",
                                    borderRadius: "50%",
                                    background: m.status === "APPROVED" ? "#16a34a" : "var(--ss-blue)",
                                    color: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "12px",
                                    fontWeight: 800
                                }}>
                                    {m.milestoneOrder || idx + 1}
                                </span>
                                <strong style={{ fontSize: "14px", color: "var(--ss-navy)" }}>{m.title}</strong>
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--ss-muted)", marginTop: "4px" }}>{m.description}</div>
                            {m.facultyFeedback && (
                                <div style={{ fontSize: "11px", color: "#166534", marginTop: "6px", background: "#dcfce7", padding: "4px 8px", borderRadius: "6px" }}>
                                    💬 Mentor Feedback: {m.facultyFeedback}
                                </div>
                            )}
                        </div>

                        <div style={{ textAlign: "right" }}>
                            <span style={{
                                fontSize: "11px",
                                fontWeight: 800,
                                padding: "4px 10px",
                                borderRadius: "999px",
                                background: m.status === "APPROVED" ? "#dcfce7" : m.status === "IN_PROGRESS" ? "#e0f2fe" : "#f1f5f9",
                                color: m.status === "APPROVED" ? "#166534" : m.status === "IN_PROGRESS" ? "#0369a1" : "#64748b"
                            }}>
                                {m.status} ({m.progressPercentage}%)
                            </span>

                            {isFaculty && m.status === "SUBMITTED_FOR_REVIEW" && (
                                <button
                                    onClick={() => setReviewModal(m)}
                                    className="button primary"
                                    style={{ display: "block", marginTop: "8px", fontSize: "11px", padding: "4px 10px" }}
                                >
                                    Review Deliverables →
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {reviewModal && (
                <div className="modal-backdrop" onClick={() => setReviewModal(null)}>
                    <div className="modal-card" style={{ maxWidth: "540px", padding: "20px" }} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ margin: "0 0 10px" }}>Faculty Milestone Review</h3>
                        <p style={{ fontSize: "13px", color: "var(--ss-muted)" }}>{reviewModal.title}</p>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Enter detailed evaluation feedback for the student team..."
                            rows={4}
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--ss-border)", marginBottom: "14px" }}
                        />
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                            <button onClick={() => handleReview(false)} className="button secondary" style={{ color: "#dc2626" }}>Request Changes</button>
                            <button onClick={() => handleReview(true)} className="button primary" style={{ background: "#16a34a" }}>Approve Milestone</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}