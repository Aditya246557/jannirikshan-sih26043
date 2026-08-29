import React, { useState } from "react";

export default function EvidenceGallery({ evidence = [], onVerify = null, canModerate = false }) {
    const [selectedItem, setSelectedItem] = useState(null);

    if (!evidence || evidence.length === 0) {
        return (
            <div style={{ padding: "20px", background: "#f8fafc", borderRadius: "12px", textAlign: "center", color: "#64748b" }}>
                No media evidence attached yet.
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "14px" }}>
                {evidence.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        style={{
                            border: "1px solid var(--ss-border)",
                            borderRadius: "14px",
                            overflow: "hidden",
                            cursor: "pointer",
                            background: "#fff",
                            transition: "0.2s transform",
                            position: "relative"
                        }}
                    >
                        <div style={{ height: "130px", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {item.contentType?.startsWith("video") ? (
                                <span style={{ fontSize: "36px" }}>🎥</span>
                            ) : (
                                <img
                                    src={item.fileUrl || "/placeholder.jpg"}
                                    alt={item.originalFileName}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    onError={(e) => {
                                        e.target.style.display = "none";
                                        e.target.parentNode.innerHTML = "<span style='font-size:32px'>🖼️</span>";
                                    }}
                                />
                            )}
                        </div>
                        <div style={{ padding: "10px" }}>
                            <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--ss-navy)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {item.originalFileName}
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
                                <span style={{
                                    fontSize: "10px",
                                    fontWeight: 800,
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    background: item.verificationStatus === "VERIFIED" ? "#dcfce7" : item.verificationStatus === "SUSPICIOUS" ? "#fee2e2" : "#f1f5f9",
                                    color: item.verificationStatus === "VERIFIED" ? "#166534" : item.verificationStatus === "SUSPICIOUS" ? "#991b1b" : "#475569"
                                }}>
                                    {item.verificationStatus || "PENDING"}
                                </span>
                                <span style={{ fontSize: "10px", color: "var(--ss-muted)" }}>
                                    {item.evidenceType === "LIVE_CAPTURE" ? "📷 Live" : "📁 Upload"}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Fullscreen Lightbox Modal */}
            {selectedItem && (
                <div className="modal-backdrop" onClick={() => setSelectedItem(null)}>
                    <div className="modal-card" style={{ maxWidth: "840px", padding: "24px" }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                            <div>
                                <strong style={{ fontSize: "16px" }}>{selectedItem.originalFileName}</strong>
                                <div style={{ fontSize: "12px", color: "var(--ss-muted)" }}>
                                    Type: {selectedItem.evidenceType} • Uploaded: {new Date(selectedItem.uploadedAt).toLocaleString()}
                                </div>
                            </div>
                            <button onClick={() => setSelectedItem(null)} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer" }}>✕</button>
                        </div>

                        <div style={{ minHeight: "300px", maxHeight: "500px", background: "#000", borderRadius: "12px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {selectedItem.contentType?.startsWith("video") ? (
                                <video src={selectedItem.fileUrl} controls style={{ maxWidth: "100%", maxHeight: "480px" }} />
                            ) : (
                                <img
                                    src={selectedItem.fileUrl}
                                    alt="Full view"
                                    style={{ maxWidth: "100%", maxHeight: "480px", objectFit: "contain" }}
                                    onError={(e) => {
                                        e.target.parentNode.innerHTML = "<div style='color:#fff;padding:40px;text-align:center'>🖼️ [Simulated Evidence Image Preview]</div>";
                                    }}
                                />
                            )}
                        </div>

                        {selectedItem.description && (
                            <div style={{ marginTop: "14px", padding: "12px", background: "#f8fafc", borderRadius: "8px", fontSize: "13px" }}>
                                <strong>Description:</strong> {selectedItem.description}
                            </div>
                        )}

                        {selectedItem.verificationNote && (
                            <div style={{ marginTop: "10px", padding: "10px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", fontSize: "12px", color: "#166534" }}>
                                <strong>Verification Note:</strong> {selectedItem.verificationNote}
                            </div>
                        )}

                        {canModerate && onVerify && (
                            <div style={{ display: "flex", gap: "10px", marginTop: "18px", borderTop: "1px solid var(--ss-border)", paddingTop: "14px" }}>
                                <button onClick={() => { onVerify(selectedItem.id, "VERIFIED", "Evidence verified by committee"); setSelectedItem(null); }} className="button primary" style={{ background: "#16a34a" }}>
                                    ✅ Mark Verified
                                </button>
                                <button onClick={() => { onVerify(selectedItem.id, "SUSPICIOUS", "Image flagged for suspicious authenticity"); setSelectedItem(null); }} className="button secondary" style={{ color: "#dc2626", borderColor: "#fca5a5" }}>
                                    ⚠️ Flag Suspicious
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}