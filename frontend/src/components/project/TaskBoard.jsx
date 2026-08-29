import React, { useState, useEffect } from "react";
import taskService from "../../services/taskService";

export default function TaskBoard({ tasks = [], onTaskUpdated }) {
  const [localTasks, setLocalTasks] = useState(tasks);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const handleMove = async (taskId, newStatus) => {
    try {
      await taskService.updateStatus(taskId, newStatus);
      setLocalTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      if (onTaskUpdated) onTaskUpdated();
    } catch (e) {
      alert("Failed to update task: " + e.message);
    }
  };

  const columns = [
    { key: "TODO", label: "📋 SPRINT BACKLOG", bg: "#17191C", border: "rgba(255,255,255,0.08)", accent: "#F59E0B" },
    { key: "IN_PROGRESS", label: "⚡ ACTIVE SPRINT", bg: "#17191C", border: "rgba(255,255,255,0.08)", accent: "#38BDF8" },
    { key: "COMPLETED", label: "✅ COMPLETED & TESTED", bg: "#17191C", border: "rgba(255,255,255,0.08)", accent: "#A8E063" }
  ];

  const currentTasks = localTasks || [];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
      {columns.map((col) => {
        const colTasks = currentTasks.filter((t) => t.status === col.key);
        return (
          <div
            key={col.key}
            style={{
              background: col.bg,
              border: `1px solid ${col.border}`,
              borderRadius: "18px",
              padding: "18px",
              minHeight: "360px",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: col.accent, boxShadow: `0 0 8px ${col.accent}` }} />
                <span style={{ fontSize: "11px", color: "#F5F5F2", fontWeight: 850, letterSpacing: "0.05em" }}>
                  {col.label}
                </span>
              </div>
              <span style={{ fontSize: "11px", fontWeight: 900, background: "#1D2023", color: col.accent, padding: "2px 8px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.06)" }}>
                {colTasks.length}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
              {colTasks.length === 0 ? (
                <div style={{ border: "1px dashed rgba(255,255,255,0.08)", borderRadius: "12px", padding: "30px 14px", textAlign: "center", color: "#8F9499", fontSize: "11.5px", marginTop: "10px" }}>
                  No tasks in this lane
                </div>
              ) : (
                colTasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      background: "#1D2023",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "12px",
                      padding: "14px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{
                        fontSize: "9px",
                        fontWeight: 900,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: task.priority === "HIGH" ? "rgba(255, 92, 92, 0.15)" : "rgba(245, 158, 11, 0.15)",
                        color: task.priority === "HIGH" ? "#FF5C5C" : "#F59E0B"
                      }}>
                        {task.priority || "MEDIUM"}
                      </span>
                      <span style={{ fontSize: "9.5px", color: "#8F9499" }}>TASK #{task.id}</span>
                    </div>

                    <strong style={{ display: "block", fontSize: "13px", color: "#F5F5F2", marginBottom: "4px" }}>
                      {task.title}
                    </strong>

                    {task.description && (
                      <p style={{ fontSize: "11.5px", color: "#8F9499", margin: "0 0 10px", lineHeight: 1.35 }}>
                        {task.description}
                      </p>
                    )}

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px", marginTop: "6px" }}>
                      {task.status !== "TODO" && (
                        <button
                          type="button"
                          onClick={() => handleMove(task.id, "TODO")}
                          style={{ background: "#17191C", border: "1px solid rgba(255,255,255,0.08)", color: "#8F9499", fontSize: "10.5px", padding: "3px 8px", borderRadius: "5px", cursor: "pointer" }}
                        >
                          ← To Do
                        </button>
                      )}
                      {task.status !== "IN_PROGRESS" && (
                        <button
                          type="button"
                          onClick={() => handleMove(task.id, "IN_PROGRESS")}
                          style={{ background: "#17191C", border: "1px solid rgba(56,189,248,0.3)", color: "#38BDF8", fontSize: "10.5px", padding: "3px 8px", borderRadius: "5px", cursor: "pointer" }}
                        >
                          ⚡ Active
                        </button>
                      )}
                      {task.status !== "COMPLETED" && (
                        <button
                          type="button"
                          onClick={() => handleMove(task.id, "COMPLETED")}
                          style={{ background: "#17191C", border: "1px solid rgba(168,224,99,0.3)", color: "#A8E063", fontSize: "10.5px", padding: "3px 8px", borderRadius: "5px", cursor: "pointer" }}
                        >
                          ✓ Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
