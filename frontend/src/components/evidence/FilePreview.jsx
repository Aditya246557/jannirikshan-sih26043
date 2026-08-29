import React from "react";

export default function FilePreview({ file, onRemove }) {
  const isImage = file.type.startsWith("image/");
  const url = URL.createObjectURL(file);

  return (
    <div style={{
      position: "relative",
      width: "100px",
      height: "100px",
      borderRadius: "10px",
      overflow: "hidden",
      border: "1px solid var(--ss-border)",
      background: "#0f172a"
    }}>
      {isImage ? (
        <img src={url} alt={file.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "24px" }}>
          🎥
        </div>
      )}
      <button
        onClick={() => onRemove(file)}
        type="button"
        style={{
          position: "absolute",
          top: "4px",
          right: "4px",
          background: "rgba(220, 38, 38, 0.85)",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: "20px",
          height: "20px",
          fontSize: "11px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        ✕
      </button>
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        background: "rgba(0,0,0,0.6)",
        color: "#fff",
        fontSize: "9px",
        padding: "2px 4px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }}>
        {file.name}
      </div>
    </div>
  );
}
