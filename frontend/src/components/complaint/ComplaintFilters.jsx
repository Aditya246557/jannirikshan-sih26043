import React from "react";
import { CATEGORIES, DISTRICTS, PRIORITIES } from "../../utils/constants";

export default function ComplaintFilters({ filters, onChange, onClear }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  };

  return (
    <div style={{
      background: "#111315",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "16px",
      padding: "16px 20px",
      display: "flex",
      flexWrap: "wrap",
      gap: "12px",
      alignItems: "center",
      marginBottom: "20px"
    }}>
      {/* Search Input */}
      <div style={{ flex: "1 1 240px" }}>
        <input
          type="text"
          name="keyword"
          value={filters.keyword || ""}
          onChange={handleChange}
          placeholder="🔍 Search challenges, title, keywords..."
          style={{
            width: "100%",
            background: "#17191C",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "#F5F5F2",
            padding: "9px 14px",
            borderRadius: "8px",
            fontSize: "13px"
          }}
        />
      </div>

      {/* Category */}
      <div style={{ minWidth: "160px" }}>
        <select
          name="category"
          value={filters.category || ""}
          onChange={handleChange}
          style={{
            width: "100%",
            background: "#17191C",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "#F5F5F2",
            padding: "9px 12px",
            borderRadius: "8px",
            fontSize: "13px"
          }}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* District */}
      <div style={{ minWidth: "140px" }}>
        <select
          name="district"
          value={filters.district || ""}
          onChange={handleChange}
          style={{
            width: "100%",
            background: "#17191C",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "#F5F5F2",
            padding: "9px 12px",
            borderRadius: "8px",
            fontSize: "13px"
          }}
        >
          <option value="">All Districts</option>
          {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Priority */}
      <div style={{ minWidth: "130px" }}>
        <select
          name="priority"
          value={filters.priority || ""}
          onChange={handleChange}
          style={{
            width: "100%",
            background: "#17191C",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "#F5F5F2",
            padding: "9px 12px",
            borderRadius: "8px",
            fontSize: "13px"
          }}
        >
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Status */}
      <div style={{ minWidth: "140px" }}>
        <select
          name="status"
          value={filters.status || ""}
          onChange={handleChange}
          style={{
            width: "100%",
            background: "#17191C",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "#F5F5F2",
            padding: "9px 12px",
            borderRadius: "8px",
            fontSize: "13px"
          }}
        >
          <option value="">All Statuses</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="ASSIGNED">University Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="PROTOTYPE">Prototype</option>
          <option value="TESTING">Testing</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      <button
        onClick={onClear}
        style={{
          background: "#1D2023",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          color: "#F5F5F2",
          fontSize: "12px",
          fontWeight: 750,
          padding: "9px 16px",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        Clear Filters
      </button>
    </div>
  );
}
