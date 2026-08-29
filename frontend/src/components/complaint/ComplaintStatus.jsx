import { STATUS_CONFIG } from "../../utils/status";

export default function ComplaintStatus({ status = "SUBMITTED" }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.SUBMITTED;
    return (
        <span style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "5px 12px",
            borderRadius: "999px",
            fontSize: "11px",
            fontWeight: 800,
            background: config.bg,
            color: config.color,
            letterSpacing: "0.04em",
            textTransform: "uppercase"
        }}>
            {config.label}
        </span>
    );
}