import { PRIORITY_CONFIG } from "../../utils/priority";

export default function PriorityBadge({ priority = "MEDIUM" }) {
    const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;
    return (
        <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "4px 10px",
            borderRadius: "999px",
            fontSize: "11px",
            fontWeight: 800,
            background: config.bg,
            color: config.color,
            textTransform: "uppercase"
        }}>
            <span>{config.dot}</span>
            <span>{priority}</span>
        </span>
    );
}