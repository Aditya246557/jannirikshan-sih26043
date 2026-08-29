import React, { useRef, useState } from "react";
import aiService from "../../services/aiService";

export default function FileUploader({ files = [], setFiles, maxFiles = 8, onAiDetected }) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (incomingFiles) => {
    const valid = Array.from(incomingFiles);
    
    // Mark files with initial analyzing flag
    const newItems = valid.map((f) => {
      f._analyzing = f.type?.startsWith("image/");
      f._aiResult = null;
      return f;
    });

    const updated = [...files, ...newItems].slice(0, maxFiles);
    setFiles(updated);

    // Run Stage 1 & Stage 2 AI intake validation on any image files
    for (const f of newItems) {
      if (f.type?.startsWith("image/")) {
        try {
          const res = await aiService.validateImage(f);
          const aiData = res?.data || res;
          f._aiResult = aiData;
          f._aiValid = aiData?.valid === true;
          f._analyzing = false;

          if (onAiDetected && aiData?.valid === true && (aiData?.detected_category || aiData?.category)) {
            onAiDetected(aiData);
          }
        } catch (e) {
          f._analyzing = false;
          f._aiValid = false;
          f._aiResult = {
            valid: false,
            stage: "SERVICE_UNAVAILABLE",
            error_type: "AI_VALIDATION_UNAVAILABLE",
            message: "AI validation service is temporarily unavailable. Please try again."
          };
        }
      } else {
        f._analyzing = false;
        f._aiValid = true;
      }
    }
    // Re-render with final state
    setFiles((prev) => [...prev]);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      
      {/* DROPZONE */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: dragOver ? "2px dashed #FFD21F" : "2px dashed rgba(255, 210, 31, 0.35)",
          borderRadius: "14px",
          padding: "26px 20px",
          textAlign: "center",
          cursor: "pointer",
          background: dragOver ? "rgba(255, 210, 31, 0.08)" : "#1D2023",
          transition: "all 0.18s ease"
        }}
      >
        <span style={{ fontSize: "32px", display: "block", marginBottom: "6px" }}>📎</span>
        <strong style={{ color: "#F5F5F2", fontSize: "14px", display: "block", marginBottom: "4px" }}>
          Click or Drag photos, PDFs, or documents here
        </strong>
        <p style={{ margin: 0, color: "#8F9499", fontSize: "11px" }}>
          Supports JPG, PNG, WEBP, PDF, MP4 (Up to 50MB per file, max {maxFiles} files)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,application/pdf,video/mp4"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      {/* SELECTED FILES LIST */}
      {files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#FFD21F", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Selected Evidence Files ({files.length}/{maxFiles})
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
            {files.map((file, idx) => {
              const isImage = file.type?.startsWith("image/");
              const isPdf = file.type === "application/pdf" || file.name?.endsWith(".pdf");
              const isAnalyzing = file._analyzing;
              const aiResult = file._aiResult;
              const isValid = file._aiValid === true;
              const isRejected = file._aiValid === false;

              return (
                <div
                  key={idx}
                  style={{
                    background: isRejected ? "rgba(255, 92, 92, 0.08)" : isValid ? "rgba(52, 211, 153, 0.06)" : "#17191C",
                    border: isRejected ? "1px solid rgba(255, 92, 92, 0.35)" : isValid ? "1px solid rgba(52, 211, 153, 0.3)" : "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      background: "#222528",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      flexShrink: 0
                    }}>
                      {isImage ? "🖼️" : isPdf ? "📄" : "📁"}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{
                        fontSize: "13px",
                        fontWeight: 750,
                        color: "#F5F5F2",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}>
                        {file.name}
                      </div>
                      <div style={{ fontSize: "11px", color: "#8F9499", marginTop: "2px" }}>
                        {formatSize(file.size)} • {isImage ? "Image" : isPdf ? "PDF Document" : "Media"}
                      </div>

                      {/* AI Intake State & Feedback Badge */}
                      {isAnalyzing && (
                        <div style={{
                          fontSize: "11px",
                          fontWeight: 800,
                          color: "#FFD21F",
                          marginTop: "6px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}>
                          <span>⏳ ANALYZING EVIDENCE (Safety & Civic Relevance Filter)...</span>
                        </div>
                      )}

                      {!isAnalyzing && isValid && aiResult && (
                        <div style={{
                          fontSize: "11px",
                          fontWeight: 800,
                          color: "#34D399",
                          marginTop: "6px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span>✓ VALID CIVIC EVIDENCE:</span>
                            <span style={{ color: "#F5F5F2" }}>{aiResult.detected_class ? aiResult.detected_class.replace(/_/g, " ").toUpperCase() : "Civic Defect"}</span>
                            <span style={{ background: "rgba(52, 211, 153, 0.15)", padding: "1px 6px", borderRadius: "4px" }}>
                              {aiResult.detected_confidence ? `${aiResult.detected_confidence}% conf` : "Verified"}
                            </span>
                          </div>
                          {aiResult.category && (
                            <div style={{ fontSize: "10px", color: "#A7F3D0", fontWeight: 600 }}>
                              Category: {aiResult.category} • Dept: {aiResult.recommended_department || "Municipal Administration"}
                            </div>
                          )}
                        </div>
                      )}

                      {!isAnalyzing && isRejected && aiResult && (
                        <div style={{
                          fontSize: "11px",
                          fontWeight: 800,
                          color: "#FF5C5C",
                          marginTop: "6px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span>✕ REJECTED:</span>
                            <span style={{ color: "#FFA2A2" }}>{aiResult.message || "Invalid or unsuitable photograph."}</span>
                          </div>
                          <div style={{ fontSize: "10px", color: "#FF8E8E", fontWeight: 600 }}>
                            ⚠️ Please remove or replace this image before submitting challenge.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(idx);
                    }}
                    style={{
                      background: isRejected ? "#FF5C5C" : "rgba(255, 92, 92, 0.15)",
                      border: "none",
                      color: isRejected ? "#FFFFFF" : "#FF5C5C",
                      borderRadius: "8px",
                      padding: isRejected ? "6px 12px" : "6px 8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      cursor: "pointer",
                      fontSize: "11px",
                      fontWeight: 800,
                      flexShrink: 0
                    }}
                    title="Remove file"
                  >
                    {isRejected ? "✕ Remove" : "✕"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
