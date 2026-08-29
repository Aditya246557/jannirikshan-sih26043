import React, { useState } from "react";
import Modal from "../common/Modal";

export default function EvidenceVerificationModal({ isOpen, onClose, evidence, onVerify }) {
  const [status, setStatus] = useState("VERIFIED");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onVerify(evidence.id, status, note);
      onClose();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🛡️ Verify Evidence Authenticity">
      <form onSubmit={handleSubmit}>
        <p style={{ margin: "0 0 16px", color: "var(--ss-muted)", fontSize: "13px" }}>
          Review media for: <strong>{evidence?.originalFileName}</strong>
        </p>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "13px", fontWeight: 700, display: "block", marginBottom: "6px" }}>Verification Decision</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--ss-border)" }}
          >
            <option value="VERIFIED">✅ Verified (Authentic Ground Reality)</option>
            <option value="SUSPICIOUS">⚠️ Flag Suspicious (Metadata / Visual Inconsistency)</option>
            <option value="REJECTED">❌ Rejected (Irrelevant / Tampered)</option>
            <option value="CLARIFICATION_REQUESTED">💬 Request Clarification from Citizen</option>
          </select>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "13px", fontWeight: 700, display: "block", marginBottom: "6px" }}>Review Notes / Field Assessment</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Document reasons for verification or flags for audit trail..."
            rows={4}
            required
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--ss-border)" }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button type="button" onClick={onClose} className="button secondary">Cancel</button>
          <button type="submit" disabled={saving} className="button primary">
            {saving ? "Saving..." : "Submit Verification Decision"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
