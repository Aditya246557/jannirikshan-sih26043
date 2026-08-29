import React from "react";

export default function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  error = "",
  helpText = "",
  disabled = false
}) {
  return (
    <div style={{ marginBottom: "16px" }}>
      {label && (
        <label
          htmlFor={name}
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: 750,
            color: "#B7BCC2",
            marginBottom: "6px"
          }}
        >
          {label} {required && <span style={{ color: "#FF5C5C" }}>*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value !== undefined && value !== null ? value : ""}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        style={{
          width: "100%",
          background: "#17191C",
          border: error ? "1px solid #FF5C5C" : "1px solid rgba(255, 255, 255, 0.08)",
          color: "#F5F5F2",
          borderRadius: "8px",
          padding: "10px 14px",
          fontSize: "13px",
          outline: "none"
        }}
      />
      {helpText && <small style={{ color: "#8F9499", display: "block", marginTop: "4px", fontSize: "11px" }}>{helpText}</small>}
      {error && <small style={{ color: "#FF5C5C", display: "block", marginTop: "4px", fontSize: "11px", fontWeight: 700 }}>{error}</small>}
    </div>
  );
}