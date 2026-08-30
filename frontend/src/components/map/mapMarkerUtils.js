import L from "leaflet";

export const MAP_PRIORITY_COLORS = {
  CRITICAL: "#FF5C5C",
  HIGH: "#FFD21F",
  MEDIUM: "#F5C400",
  LOW: "#A8E063",
  DEFAULT: "#FFD21F",
  USER: "#38BDF8"
};

/**
 * Creates a professional vector location pin for Leaflet maps
 * @param {string} color - Hex color code for the pin
 * @param {number} size - Width of the pin in pixels (default: 28)
 * @param {boolean} isSelected - Whether the marker is in an active/selected state
 * @returns {L.DivIcon} Leaflet DivIcon
 */
export function createPinIcon(color = "#FFD21F", size = 28, isSelected = false) {
  const pinColor = color || MAP_PRIORITY_COLORS.HIGH;
  const h = Math.round(size * 1.3);
  const w = size;
  const filterId = `shadow-${Math.abs(hashString(pinColor))}`;

  const svgHtml = `
    <div style="position: relative; width: ${w}px; height: ${h}px; cursor: pointer; transform: translate3d(0, 0, 0); transition: transform 0.15s ease;">
      <svg width="${w}" height="${h}" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5)); overflow: visible;">
        <defs>
          <linearGradient id="${filterId}-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.35"/>
            <stop offset="60%" stop-color="${pinColor}" stop-opacity="1"/>
            <stop offset="100%" stop-color="${darken(pinColor, 0.25)}" stop-opacity="1"/>
          </linearGradient>
        </defs>
        
        <!-- Outer Pin Teardrop Body -->
        <path d="M16 0C7.163 0 0 7.163 0 16c0 11.2 14.5 24.8 15.15 25.4a1.25 1.25 0 001.7 0C17.5 40.8 32 27.2 32 16 32 7.163 24.837 0 16 0z" fill="url(#${filterId}-grad)"/>
        
        <!-- Crisp White Inner Bezel -->
        <path d="M16 1.5C8.01 1.5 1.5 8.01 1.5 16c0 9.8 13 22 14.5 23.6 1.5-1.6 14.5-13.8 14.5-23.6 0-7.99-6.51-14.5-14.5-14.5z" stroke="#FFFFFF" stroke-width="1.5" stroke-opacity="0.9"/>
        
        <!-- Dark Circular Core -->
        <circle cx="16" cy="15" r="7" fill="#121417"/>
        <circle cx="16" cy="15" r="4.5" fill="#FFFFFF"/>
        <circle cx="16" cy="15" r="2.5" fill="${pinColor}"/>
      </svg>
      ${isSelected ? `<div style="position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%); width: 10px; height: 3px; background: rgba(255, 210, 31, 0.7); border-radius: 50%; filter: blur(1px);"></div>` : ""}
    </div>
  `;

  return L.divIcon({
    className: "jannirikshan-map-pin",
    html: svgHtml,
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
    popupAnchor: [0, -h + 2]
  });
}

/**
 * Creates a pulsing location indicator for user's GPS position
 */
export function createUserLocationIcon(size = 28) {
  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px; cursor: default;">
      <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: rgba(56, 189, 248, 0.35); animation: pulse 2s infinite ease-out;"></div>
      <div style="position: absolute; top: 4px; left: 4px; width: ${size - 8}px; height: ${size - 8}px; border-radius: 50%; background: #38bdf8; border: 2.5px solid #ffffff; box-shadow: 0 0 12px #38bdf8;"></div>
    </div>
  `;

  return L.divIcon({
    className: "jannirikshan-user-pin",
    html: html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function darken(hex, factor = 0.2) {
  if (!hex || !hex.startsWith("#")) return hex;
  const num = parseInt(hex.slice(1), 16);
  let r = Math.max(0, Math.floor(((num >> 16) & 255) * (1 - factor)));
  let g = Math.max(0, Math.floor(((num >> 8) & 255) * (1 - factor)));
  let b = Math.max(0, Math.floor((num & 255) * (1 - factor)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}