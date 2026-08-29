export default function Button({
    children,
    onClick,
    type = "button",
    variant = "primary",
    disabled = false,
    className = "",
    icon = null,
    size = "md"
}) {
    const sizeStyle = size === "sm" ? "px-3 py-1.5 text-xs" : size === "lg" ? "px-6 py-3 text-base" : "px-4 py-2 text-sm";
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`button ${variant} ${sizeStyle} ${className}`}
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: disabled ? 0.6 : 1 }}
        >
            {icon && <span>{icon}</span>}
            {children}
        </button>
    );
}