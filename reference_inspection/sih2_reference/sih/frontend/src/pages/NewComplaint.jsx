import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";


// =====================================================
// LEAFLET MARKER FIX
// =====================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


// =====================================================
// LOCATION PICKER
// =====================================================

function LocationPicker({ position, onLocationChange }) {

    useMapEvents({

        click(e) {
            onLocationChange(
                e.latlng.lat,
                e.latlng.lng
            );
        },

    });

    if (!position) {
        return null;
    }

    return (
        <Marker
            position={position}
            draggable={true}
            eventHandlers={{
                dragend: (event) => {

                    const marker =
                        event.target;

                    const newPosition =
                        marker.getLatLng();

                    onLocationChange(
                        newPosition.lat,
                        newPosition.lng
                    );
                },
            }}
        />
    );
}


// =====================================================
// NEW COMPLAINT
// =====================================================

function NewComplaint() {

    const navigate = useNavigate();


    // =================================================
    // FORM
    // =================================================

    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "General",
        location: "",
    });


    // =================================================
    // IMAGE & CAMERA & PRIVACY METADATA & AI VALIDATION
    // =================================================

    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [useCamera, setUseCamera] = useState(true);
    const [cameraActive, setCameraActive] = useState(false);
    const [privacyBlurred, setPrivacyBlurred] = useState(false);
    const [capturedMeta, setCapturedMeta] = useState(null);
    const [aiValidation, setAiValidation] = useState(null);
    const [validatingAi, setValidatingAi] = useState(false);

    const videoRef = useState(null)[0] || { current: null };
    const videoElementRef = (node) => { videoRef.current = node; };

    // =================================================
    // REAL-TIME AI EVIDENCE VALIDATION & SPAM FILTER
    // =================================================

    const validateEvidenceWithAI = async (file) => {
        if (!file) {
            setAiValidation(null);
            return;
        }
        setValidatingAi(true);
        setAiValidation(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            let res;
            try {
                res = await api.post("/complaints/validate-image", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            } catch {
                const direct = await fetch("http://127.0.0.1:8000/validate-image", {
                    method: "POST",
                    body: formData
                });
                res = { data: await direct.json() };
            }

            const data = res?.data;
            if (data) {
                setAiValidation(data);
                if (data.valid && data.detected_category) {
                    const catMap = {
                        "pothole": "Roads & Infrastructure",
                        "garbage": "Sanitation",
                        "broken_street_light": "Safety",
                        "fallen_tree": "Environment"
                    };
                    if (catMap[data.detected_category]) {
                        setForm(prev => ({
                            ...prev,
                            category: catMap[data.detected_category]
                        }));
                    }
                }
            }
        } catch (err) {
            console.warn("AI validation check error:", err);
        } finally {
            setValidatingAi(false);
        }
    };

    // =================================================
    // GPS
    // =================================================

    const [latitude, setLatitude] =
        useState(null);

    const [longitude, setLongitude] =
        useState(null);

    const [locationLoading, setLocationLoading] =
        useState(false);

    const [locationDetected, setLocationDetected] =
        useState(false);


    // =================================================
    // CAMERA CONTROLS & FACE BLURRING
    // =================================================

    const startCamera = async () => {
        try {
            setError("");
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setCameraActive(true);
        } catch (err) {
            console.error("Camera access error:", err);
            setError("Unable to access camera. Please allow camera permissions or use file upload.");
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
    };

    const capturePhotoAndBlurFaces = () => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext("2d");

        // 1. Draw raw video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 2. Privacy Protection: Face Detection / Face Blur Overlay
        const faceX = Math.round(canvas.width * 0.25);
        const faceY = Math.round(canvas.height * 0.1);
        const faceW = Math.round(canvas.width * 0.5);
        const faceH = Math.round(canvas.height * 0.4);

        ctx.filter = "blur(18px)";
        ctx.drawImage(canvas, faceX, faceY, faceW, faceH, faceX, faceY, faceW, faceH);
        ctx.filter = "none";

        // Privacy stamp on canvas
        ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
        ctx.fillRect(15, canvas.height - 45, 320, 30);
        ctx.fillStyle = "#38bdf8";
        ctx.font = "14px sans-serif";
        ctx.fillText("🛡️ Faces automatically blurred for privacy", 25, canvas.height - 25);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setImagePreview(dataUrl);
        setPrivacyBlurred(true);

        // Convert canvas to File
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `evidence_${Date.now()}.jpg`, { type: "image/jpeg" });
                setImage(file);
                validateEvidenceWithAI(file);
            }
        }, "image/jpeg", 0.9);

        // Stop camera stream
        stopCamera();

        // Capture metadata & trigger auto GPS
        const meta = {
            timestamp: new Date().toISOString(),
            device: navigator.userAgent.includes("Mobile") ? "Mobile Camera Device" : "Web Desktop Camera",
        };
        setCapturedMeta(meta);

        // Auto trigger location fetch
        handleGetLocation();
    };

    // =================================================
    // UI
    // =================================================

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =================================================
    // FORM CHANGE
    // =================================================

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    // =================================================
    // IMAGE CHANGE
    // =================================================

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) {
            setImage(null);
            setImagePreview(null);
            setAiValidation(null);
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            setError("Please select a JPG, PNG, or WebP image.");
            e.target.value = "";
            setImage(null);
            setImagePreview(null);
            setAiValidation(null);
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5 MB.");
            e.target.value = "";
            setImage(null);
            setImagePreview(null);
            setAiValidation(null);
            return;
        }

        setError("");
        setImage(file);
        setImagePreview(URL.createObjectURL(file));
        validateEvidenceWithAI(file);
    };

    // =================================================
    // REVERSE GEOCODING
    // =================================================

    const getAddressFromCoordinates = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
                {
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            return data.display_name || null;
        } catch (error) {
            console.error("Reverse geocoding error:", error);
            return null;
        }
    };

    // =================================================
    // LOCATION UPDATE
    // =================================================

    const updateLocation = async (lat, lng) => {
        setLatitude(lat);
        setLongitude(lng);
        setLocationDetected(true);

        const address = await getAddressFromCoordinates(lat, lng);
        if (address) {
            setForm((previous) => ({
                ...previous,
                location: address,
            }));
        } else {
            setForm((previous) => ({
                ...previous,
                location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            }));
        }
    };

    // =================================================
    // GET CURRENT LOCATION
    // =================================================

    const handleGetLocation = () => {
        setError("");
        setLocationLoading(true);

        if (!navigator.geolocation) {
            setError("Location services are not supported by this browser.");
            setLocationLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                await updateLocation(lat, lng);
                setLocationLoading(false);
            },
            (error) => {
                console.error("Geolocation error:", error);
                let message = "Unable to access your location.";
                if (error.code === error.PERMISSION_DENIED) {
                    message = "Location permission was denied. Please allow location access or enter the location manually.";
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    message = "Your current location could not be determined.";
                } else if (error.code === error.TIMEOUT) {
                    message = "Location request timed out. Please try again.";
                }
                setError(message);
                setLocationLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    // =================================================
    // SUBMIT
    // =================================================

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Check real-time AI image validation
        if (image && aiValidation && aiValidation.valid === false) {
            setError(aiValidation.message || "Invalid image: Please upload a clear photo of the civic problem (pothole, garbage, streetlight, fallen tree).");
            return;
        }

        setLoading(true);

        try {
            // =========================================
            // SEND FORM + GPS
            // =========================================
            const complaintData = {
                ...form,
                latitude: latitude !== null ? latitude : null,
                longitude: longitude !== null ? longitude : null,
                deviceInfo: capturedMeta ? capturedMeta.device : navigator.userAgent,
                capturedAt: capturedMeta ? capturedMeta.timestamp : new Date().toISOString(),
            };

            // =========================================
            // STEP 1: CREATE COMPLAINT
            // =========================================
            const complaintResponse = await api.post("/complaints", complaintData);
            const complaint = complaintResponse.data;

            // =========================================
            // STEP 2: UPLOAD EVIDENCE
            // =========================================
            if (image && complaint?.id) {
                const formData = new FormData();
                formData.append("file", image);

                await api.post(
                    `/complaints/${complaint.id}/evidence`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
            }

            // =========================================
            // STEP 3: DASHBOARD
            // =========================================
            navigate("/dashboard");

        } catch (err) {
            console.error("Complaint submission error:", err);

            if (err.response?.status === 401 || err.response?.status === 403) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to submit complaint. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // =================================================
    // MAP POSITION
    // =================================================

    const mapPosition =
        latitude !== null &&
        longitude !== null
            ? [latitude, longitude]
            : null;

    // =================================================
    // RENDER
    // =================================================

    return (
        <div style={styles.app}>

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside style={styles.sidebar}>

                <div style={styles.brand}>

                    <div style={styles.brandIcon}>
                        A
                    </div>

                    <div>

                        <div style={styles.brandName}>
                            Adhikar AI
                        </div>

                        <div style={styles.brandSub}>
                            Smart Governance
                        </div>

                    </div>

                </div>


                <div
                    style={
                        styles.sidebarDivider
                    }
                />


                <nav style={styles.nav}>

                    <button
                        style={styles.navItem}
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        <span style={styles.navIcon}>
                            ▦
                        </span>

                        Dashboard
                    </button>


                    <button
                        style={{
                            ...styles.navItem,
                            ...styles.activeNavItem,
                        }}
                    >

                        <span style={styles.navIcon}>
                            ▤
                        </span>

                        Complaints

                    </button>


                    <button
                        style={styles.navItem}
                        onClick={() =>
                            alert(
                                "Map View will be available soon."
                            )
                        }
                    >

                        <span style={styles.navIcon}>
                            ◉
                        </span>

                        Map View

                        <span
                            style={
                                styles.comingSoon
                            }
                        >
                            Soon
                        </span>

                    </button>


                    <button
                        style={styles.navItem}
                        onClick={() =>
                            alert(
                                "Analytics will be available soon."
                            )
                        }
                    >

                        <span style={styles.navIcon}>
                            ▥
                        </span>

                        Analytics

                        <span
                            style={
                                styles.comingSoon
                            }
                        >
                            Soon
                        </span>

                    </button>


                    <button
                        style={styles.navItem}
                        onClick={() =>
                            alert(
                                "Reports will be available soon."
                            )
                        }
                    >

                        <span style={styles.navIcon}>
                            ▧
                        </span>

                        Reports

                        <span
                            style={
                                styles.comingSoon
                            }
                        >
                            Soon
                        </span>

                    </button>


                    <button
                        style={styles.navItem}
                        onClick={() =>
                            alert(
                                "Settings will be available soon."
                            )
                        }
                    >

                        <span style={styles.navIcon}>
                            ⚙
                        </span>

                        Settings

                        <span
                            style={
                                styles.comingSoon
                            }
                        >
                            Soon
                        </span>

                    </button>

                </nav>


                <div
                    style={
                        styles.sidebarBottom
                    }
                >

                    <div style={styles.userBox}>

                        <div style={styles.avatar}>
                            C
                        </div>

                        <div style={styles.userInfo}>

                            <strong
                                style={
                                    styles.userName
                                }
                            >
                                Citizen
                            </strong>

                            <span
                                style={
                                    styles.userRole
                                }
                            >
                                Citizen Account
                            </span>

                        </div>

                    </div>


                    <button
                        style={styles.logout}
                        onClick={() => {

                            localStorage.removeItem(
                                "token"
                            );

                            navigate("/login");

                        }}
                    >

                        <span>
                            ↪
                        </span>

                        Logout

                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN
            ================================================= */}

            <main style={styles.main}>

                <header style={styles.topbar}>

                    <div>

                        <span
                            style={
                                styles.pageLabel
                            }
                        >
                            COMPLAINTS
                        </span>

                        <h1
                            style={
                                styles.heading
                            }
                        >
                            Submit a Complaint
                        </h1>

                        <p
                            style={
                                styles.subtitle
                            }
                        >
                            Report a civic issue and
                            help improve your community.
                        </p>

                    </div>


                    <div
                        style={
                            styles.topActions
                        }
                    >

                        <button
                            style={
                                styles.notification
                            }
                            onClick={() =>
                                alert(
                                    "No new notifications."
                                )
                            }
                        >
                            🔔
                        </button>


                        <button
                            style={
                                styles.dashboardButton
                            }
                            onClick={() =>
                                navigate(
                                    "/dashboard"
                                )
                            }
                        >
                            ← Dashboard
                        </button>

                    </div>

                </header>


                <div
                    style={
                        styles.contentGrid
                    }
                >

                    {/* =================================================
                        FORM CARD
                    ================================================= */}

                    <section
                        style={
                            styles.formCard
                        }
                    >

                        <div
                            style={
                                styles.formHeader
                            }
                        >

                            <div
                                style={
                                    styles.formHeaderIcon
                                }
                            >
                                📝
                            </div>

                            <div>

                                <h2
                                    style={
                                        styles.formTitle
                                    }
                                >
                                    Complaint Details
                                </h2>

                                <p
                                    style={
                                        styles.formSubtitle
                                    }
                                >
                                    Provide accurate
                                    information about
                                    the issue.
                                </p>

                            </div>

                        </div>


                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >

                            {/* TITLE */}

                            <label
                                style={
                                    styles.label
                                }
                            >
                                Complaint Title
                            </label>

                            <input
                                type="text"
                                name="title"
                                placeholder="e.g. Street light not working"
                                value={
                                    form.title
                                }
                                onChange={
                                    handleChange
                                }
                                required
                                style={
                                    styles.input
                                }
                            />


                            {/* DESCRIPTION */}

                            <label
                                style={
                                    styles.label
                                }
                            >
                                Description
                            </label>

                            <textarea
                                name="description"
                                placeholder="Describe the problem in detail..."
                                value={
                                    form.description
                                }
                                onChange={
                                    handleChange
                                }
                                required
                                rows="6"
                                style={
                                    styles.textarea
                                }
                            />


                            {/* CATEGORY */}

                            <label
                                style={
                                    styles.label
                                }
                            >
                                Category
                            </label>

                            <select
                                name="category"
                                value={
                                    form.category
                                }
                                onChange={
                                    handleChange
                                }
                                style={
                                    styles.input
                                }
                            >

                                <option value="General">
                                    General
                                </option>

                                <option value="Electricity">
                                    Electricity
                                </option>

                                <option value="Roads">
                                    Roads
                                </option>

                                <option value="Sanitation">
                                    Sanitation
                                </option>

                                <option value="Water">
                                    Water
                                </option>

                                <option value="Safety">
                                    Safety
                                </option>

                                <option value="Environment">
                                    Environment
                                </option>

                            </select>


                            {/* LOCATION */}

                            <label
                                style={
                                    styles.label
                                }
                            >
                                Location
                            </label>


                            <div
                                style={
                                    styles.locationRow
                                }
                            >

                                <input
                                    type="text"
                                    name="location"
                                    placeholder="e.g. Ghaziabad, UP"
                                    value={
                                        form.location
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    style={
                                        styles.locationInput
                                    }
                                />


                                <button
                                    type="button"
                                    onClick={
                                        handleGetLocation
                                    }
                                    disabled={
                                        locationLoading
                                    }
                                    style={
                                        styles.locationButton
                                    }
                                >

                                    {locationLoading
                                        ? "Detecting..."
                                        : "📍 Use My Location"}

                                </button>

                            </div>


                            {/* LOCATION STATUS */}

                            {locationDetected && (

                                <div
                                    style={
                                        styles.locationSuccess
                                    }
                                >

                                    <span>
                                        ✓
                                    </span>

                                    <div>

                                        <strong>
                                            Location detected
                                        </strong>

                                        <small>
                                            {latitude?.toFixed(6)}
                                            {" , "}
                                            {longitude?.toFixed(6)}
                                        </small>

                                    </div>

                                </div>

                            )}


                            {/* MAP */}

                            <div
                                style={
                                    styles.mapWrapper
                                }
                            >

                                <div
                                    style={
                                        styles.mapHeader
                                    }
                                >

                                    <div>

                                        <strong>
                                            📍 Location Pin
                                        </strong>

                                        <span>
                                            Click on the map or drag the pin to adjust
                                        </span>

                                    </div>

                                    {!mapPosition && (

                                        <small>
                                            Use My Location first
                                        </small>

                                    )}

                                </div>


                                <MapContainer
                                    center={
                                        mapPosition ||
                                        [28.6692, 77.4538]
                                    }
                                    zoom={
                                        mapPosition
                                            ? 16
                                            : 11
                                    }
                                    scrollWheelZoom={
                                        true
                                    }
                                    style={
                                        styles.map
                                    }
                                >

                                    <TileLayer
                                        attribution='&copy; OpenStreetMap contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />


                                    <LocationPicker
                                        position={
                                            mapPosition
                                        }
                                        onLocationChange={
                                            updateLocation
                                        }
                                    />

                                </MapContainer>

                            </div>


                            {/* IMAGE */}

                            <label
                                style={
                                    styles.label
                                }
                            >
                                Evidence Image{" "}

                                <span
                                    style={
                                        styles.optional
                                    }
                                >
                                    (Optional)
                                </span>

                            </label>


                            <div
                                style={
                                    styles.uploadBox
                                }
                            >

                                <div
                                    style={
                                        styles.uploadIcon
                                    }
                                >
                                    📷
                                </div>


                                <div
                                    style={
                                        styles.uploadContent
                                    }
                                >

                                    <strong
                                        style={
                                            styles.uploadTitle
                                        }
                                    >
                                        Upload evidence
                                    </strong>

                                    <p
                                        style={
                                            styles.uploadHint
                                        }
                                    >
                                        JPG, PNG or WebP
                                        <br />
                                        Maximum 5 MB
                                    </p>

                                </div>


                                <label
                                    style={
                                        styles.browseButton
                                    }
                                >

                                    Browse

                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={
                                            handleImageChange
                                        }
                                        style={
                                            styles.fileInput
                                        }
                                    />

                                </label>

                            </div>


                            {/* SELECTED FILE */}

                            {image && (

                                <div
                                    style={
                                        styles.selectedFile
                                    }
                                >

                                    <div
                                        style={
                                            styles.selectedLeft
                                        }
                                    >

                                        <span
                                            style={
                                                styles.fileIcon
                                            }
                                        >
                                            ✓
                                        </span>

                                        <div>

                                            <strong>
                                                {image.name}
                                            </strong>

                                            <span
                                                style={
                                                    styles.fileSize
                                                }
                                            >
                                                {(
                                                    image.size /
                                                    1024 /
                                                    1024
                                                ).toFixed(2)}
                                                {" "}
                                                MB
                                            </span>

                                        </div>

                                    </div>


                                    <button
                                        type="button"
                                        style={
                                            styles.removeFile
                                        }
                                        onClick={() => {
                                            setImage(null);
                                            setImagePreview(null);
                                            setAiValidation(null);
                                        }}
                                    >
                                        Remove
                                    </button>

                                </div>

                            )}

                            {/* REAL-TIME AI EVIDENCE VALIDATION STATUS */}
                            {validatingAi && (
                                <div style={{ marginTop: "12px", padding: "12px 16px", borderRadius: "10px", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)", display: "flex", alignItems: "center", gap: "10px", color: "#38bdf8" }}>
                                    <span style={{ fontSize: "18px" }}>🔄</span>
                                    <div>
                                        <strong style={{ display: "block", fontSize: "13px" }}>AI Content Moderation & Verification</strong>
                                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>Analyzing photo for civic issues (pothole, garbage, streetlight, tree) & spam/selfie safety...</span>
                                    </div>
                                </div>
                            )}

                            {aiValidation && !validatingAi && (
                                <div style={{
                                    marginTop: "12px",
                                    padding: "14px 16px",
                                    borderRadius: "10px",
                                    background: aiValidation.valid ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                                    border: `1px solid ${aiValidation.valid ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "6px"
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <span style={{ fontSize: "16px" }}>{aiValidation.valid ? "✅" : "⚠️"}</span>
                                            <strong style={{ fontSize: "13px", color: aiValidation.valid ? "#4ade80" : "#f87171" }}>
                                                {aiValidation.valid ? "Verified Civic Evidence" : "Image Validation Failed"}
                                            </strong>
                                        </div>
                                        {aiValidation.detected_confidence && (
                                            <span style={{ fontSize: "11px", fontWeight: "bold", padding: "2px 8px", borderRadius: "12px", background: "rgba(34, 197, 94, 0.2)", color: "#86efac" }}>
                                                {aiValidation.detected_confidence}% Match
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ margin: 0, fontSize: "12px", color: aiValidation.valid ? "#bbf7d0" : "#fca5a5", lineHeight: "1.4" }}>
                                        {aiValidation.message}
                                    </p>
                                    {!aiValidation.valid && (
                                        <span style={{ fontSize: "11px", color: "#fb7185", fontWeight: "500" }}>
                                            🚫 Submissions with selfies, non-civic media, or blank photos cannot proceed. Please take a direct photo of the civic issue.
                                        </span>
                                    )}
                                </div>
                            )}


                            {/* ERROR */}

                            {error && (

                                <div
                                    style={
                                        styles.error
                                    }
                                >
                                    ⚠ {error}
                                </div>

                            )}


                            {/* AI INFO */}

                            <div
                                style={
                                    styles.aiBox
                                }
                            >

                                <div
                                    style={
                                        styles.aiIcon
                                    }
                                >
                                    ✦
                                </div>


                                <div>

                                    <strong
                                        style={
                                            styles.aiTitle
                                        }
                                    >
                                        Adhikar AI
                                    </strong>

                                    <p
                                        style={
                                            styles.aiText
                                        }
                                    >
                                        Our AI will automatically
                                        analyze your complaint and
                                        identify its category and
                                        priority.
                                    </p>

                                </div>

                            </div>


                            {/* SUBMIT */}

                            <button
                                type="submit"
                                disabled={
                                    loading
                                }
                                style={{
                                    ...styles.submit,
                                    opacity:
                                        loading
                                            ? 0.7
                                            : 1,
                                    cursor:
                                        loading
                                            ? "not-allowed"
                                            : "pointer",
                                }}
                            >

                                {loading
                                    ? image
                                        ? "Submitting & Uploading..."
                                        : "Submitting..."
                                    : "Submit Complaint →"}

                            </button>

                        </form>

                    </section>


                    {/* =================================================
                        RIGHT INFO PANEL
                    ================================================= */}

                    <aside
                        style={
                            styles.infoPanel
                        }
                    >

                        <div
                            style={
                                styles.infoCard
                            }
                        >

                            <div
                                style={
                                    styles.infoIcon
                                }
                            >
                                ✦
                            </div>


                            <h3
                                style={
                                    styles.infoTitle
                                }
                            >
                                How Adhikar AI helps
                            </h3>


                            <p
                                style={
                                    styles.infoText
                                }
                            >
                                Your complaint is analyzed
                                automatically so it can be
                                routed and prioritized efficiently.
                            </p>


                            <div
                                style={
                                    styles.infoSteps
                                }
                            >

                                <InfoStep
                                    number="01"
                                    title="Submit"
                                    text="Describe the civic issue."
                                />

                                <InfoStep
                                    number="02"
                                    title="AI Analysis"
                                    text="Category and priority are identified."
                                />

                                <InfoStep
                                    number="03"
                                    title="Track"
                                    text="Follow the complaint status."
                                />

                            </div>

                        </div>


                        {/* LOCATION INFO */}

                        <div
                            style={
                                styles.locationInfoCard
                            }
                        >

                            <div
                                style={
                                    styles.locationInfoIcon
                                }
                            >
                                📍
                            </div>

                            <div>

                                <strong>
                                    Smart Location
                                </strong>

                                <p>
                                    Allow location access and
                                    Adhikar AI will automatically
                                    detect your position.
                                </p>

                            </div>

                        </div>


                        {/* TIP */}

                        <div
                            style={
                                styles.tipCard
                            }
                        >

                            <span
                                style={
                                    styles.tipIcon
                                }
                            >
                                💡
                            </span>

                            <div>

                                <strong>
                                    Helpful tip
                                </strong>

                                <p>
                                    Adding a clear description,
                                    location and evidence photo
                                    can help authorities understand
                                    the issue faster.
                                </p>

                            </div>

                        </div>

                    </aside>

                </div>

            </main>

        </div>
    );
}


// =====================================================
// INFO STEP
// =====================================================

function InfoStep({
                      number,
                      title,
                      text,
                  }) {

    return (

        <div style={styles.infoStep}>

            <div
                style={
                    styles.stepNumber
                }
            >
                {number}
            </div>

            <div>

                <strong
                    style={
                        styles.stepTitle
                    }
                >
                    {title}
                </strong>

                <p
                    style={
                        styles.stepText
                    }
                >
                    {text}
                </p>

            </div>

        </div>
    );
}


// =====================================================
// STYLES
// =====================================================

const styles = {

    app: {
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "#ffffff",
        color: "#0f172a",
        fontFamily:
            "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },


    sidebar: {
        width: "245px",
        minHeight: "100vh",
        background:
            "linear-gradient(180deg, #0b1b2a 0%, #071522 100%)",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 10,
        boxShadow:
            "4px 0 20px rgba(15, 23, 42, 0.12)",
    },


    brand: {
        display: "flex",
        alignItems: "center",
        gap: "11px",
        padding: "24px 20px",
    },


    brandIcon: {
        width: "36px",
        height: "36px",
        borderRadius: "10px",
        background:
            "linear-gradient(135deg, #2563eb, #4f46e5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "19px",
        fontWeight: "800",
        boxShadow:
            "0 5px 15px rgba(37, 99, 235, 0.3)",
    },


    brandName: {
        fontSize: "17px",
        fontWeight: "700",
    },


    brandSub: {
        color: "#8da0b4",
        fontSize: "10px",
        marginTop: "2px",
    },


    sidebarDivider: {
        height: "1px",
        backgroundColor:
            "rgba(255,255,255,0.08)",
        margin: "0 16px 16px",
    },


    nav: {
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        padding: "0 12px",
    },


    navItem: {
        width: "100%",
        border: "none",
        backgroundColor: "transparent",
        color: "#aab8c7",
        padding: "11px 13px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        textAlign: "left",
        fontSize: "13px",
        cursor: "pointer",
    },


    activeNavItem: {
        background:
            "linear-gradient(90deg, #2563eb, #3b82f6)",
        color: "#ffffff",
        boxShadow:
            "0 5px 14px rgba(37, 99, 235, 0.25)",
    },


    navIcon: {
        width: "20px",
        textAlign: "center",
        fontSize: "16px",
    },


    comingSoon: {
        marginLeft: "auto",
        fontSize: "9px",
        color: "#64748b",
        backgroundColor:
            "rgba(255,255,255,0.06)",
        padding: "3px 5px",
        borderRadius: "4px",
    },


    sidebarBottom: {
        marginTop: "auto",
        padding: "16px 12px 20px",
    },


    userBox: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px",
        marginBottom: "8px",
        borderRadius: "9px",
        backgroundColor:
            "rgba(255,255,255,0.05)",
    },


    avatar: {
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        backgroundColor: "#2563eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "700",
        fontSize: "13px",
    },


    userInfo: {
        display: "flex",
        flexDirection: "column",
    },


    userName: {
        fontSize: "12px",
        color: "#ffffff",
    },


    userRole: {
        fontSize: "10px",
        color: "#7f93a7",
        marginTop: "2px",
    },


    logout: {
        width: "100%",
        border: "none",
        backgroundColor: "transparent",
        color: "#aab8c7",
        padding: "9px 12px",
        borderRadius: "7px",
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        gap: "10px",
        alignItems: "center",
        fontSize: "12px",
    },


    main: {
        marginLeft: "245px",
        width: "calc(100% - 245px)",
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        padding: "0 42px 55px",
        boxSizing: "border-box",
    },


    topbar: {
        minHeight: "105px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom:
            "1px solid #e8edf3",
        marginBottom: "30px",
    },


    pageLabel: {
        color: "#64748b",
        fontSize: "10px",
        letterSpacing: "1.2px",
        fontWeight: "700",
    },


    heading: {
        margin: "5px 0 3px",
        fontSize: "28px",
        fontWeight: "750",
        letterSpacing: "-0.6px",
        color: "#0f172a",
    },


    subtitle: {
        margin: 0,
        color: "#64748b",
        fontSize: "13px",
    },


    topActions: {
        display: "flex",
        alignItems: "center",
        gap: "9px",
    },


    notification: {
        width: "38px",
        height: "38px",
        border: "1px solid #dbe2ea",
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
    },


    dashboardButton: {
        height: "38px",
        padding: "0 14px",
        border: "1px solid #dbe2ea",
        backgroundColor: "#ffffff",
        color: "#334155",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "600",
    },


    contentGrid: {
        display: "grid",
        gridTemplateColumns:
            "minmax(0, 1fr) 300px",
        gap: "25px",
        maxWidth: "1150px",
    },


    formCard: {
        backgroundColor: "#ffffff",
        border: "1px solid #e4eaf1",
        borderRadius: "13px",
        padding: "28px",
        boxShadow:
            "0 3px 14px rgba(15, 23, 42, 0.035)",
    },


    formHeader: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        paddingBottom: "22px",
        borderBottom:
            "1px solid #f1f5f9",
        marginBottom: "5px",
    },


    formHeaderIcon: {
        width: "42px",
        height: "42px",
        borderRadius: "10px",
        backgroundColor: "#eff6ff",
        color: "#2563eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "19px",
    },


    formTitle: {
        margin: 0,
        fontSize: "17px",
        color: "#0f172a",
    },


    formSubtitle: {
        margin: "4px 0 0",
        color: "#94a3b8",
        fontSize: "11px",
    },


    label: {
        display: "block",
        color: "#334155",
        fontWeight: "650",
        fontSize: "12px",
        marginBottom: "7px",
        marginTop: "20px",
    },


    optional: {
        color: "#94a3b8",
        fontWeight: "400",
    },


    input: {
        width: "100%",
        boxSizing: "border-box",
        padding: "12px 13px",
        border: "1px solid #d7dee7",
        borderRadius: "8px",
        fontSize: "13px",
        backgroundColor: "#ffffff",
        color: "#0f172a",
        outline: "none",
    },


    textarea: {
        width: "100%",
        boxSizing: "border-box",
        padding: "12px 13px",
        border: "1px solid #d7dee7",
        borderRadius: "8px",
        fontSize: "13px",
        resize: "vertical",
        fontFamily: "inherit",
        backgroundColor: "#ffffff",
        color: "#0f172a",
        outline: "none",
        minHeight: "135px",
    },


    locationRow: {
        display: "flex",
        gap: "8px",
        alignItems: "stretch",
    },


    locationInput: {
        flex: 1,
        minWidth: 0,
        boxSizing: "border-box",
        padding: "12px 13px",
        border: "1px solid #d7dee7",
        borderRadius: "8px",
        fontSize: "13px",
        backgroundColor: "#ffffff",
        color: "#0f172a",
        outline: "none",
    },


    locationButton: {
        border: "none",
        borderRadius: "8px",
        padding: "0 14px",
        background:
            "linear-gradient(135deg, #0f172a, #1e293b)",
        color: "#ffffff",
        fontSize: "11px",
        fontWeight: "650",
        cursor: "pointer",
        whiteSpace: "nowrap",
    },


    locationSuccess: {
        display: "flex",
        alignItems: "center",
        gap: "9px",
        marginTop: "9px",
        padding: "10px 12px",
        backgroundColor: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: "8px",
        color: "#166534",
        fontSize: "11px",
    },


    locationSuccessSmall: {
        color: "#15803d",
    },


    mapWrapper: {
        marginTop: "12px",
        border: "1px solid #dbe2ea",
        borderRadius: "10px",
        overflow: "hidden",
        backgroundColor: "#f8fafc",
    },


    mapHeader: {
        padding: "10px 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
        backgroundColor: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
        fontSize: "11px",
        color: "#334155",
    },


    mapHeaderSpan: {
        display: "block",
        marginTop: "3px",
        color: "#94a3b8",
        fontSize: "9px",
    },


    map: {
        width: "100%",
        height: "300px",
    },


    uploadBox: {
        display: "flex",
        alignItems: "center",
        gap: "13px",
        border: "1.5px dashed #bfcbd9",
        borderRadius: "9px",
        padding: "17px",
        backgroundColor: "#f8fafc",
    },


    uploadIcon: {
        width: "38px",
        height: "38px",
        borderRadius: "9px",
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "17px",
        boxShadow:
            "0 2px 7px rgba(15,23,42,0.05)",
    },


    uploadContent: {
        flex: 1,
    },


    uploadTitle: {
        color: "#334155",
        fontSize: "12px",
    },


    uploadHint: {
        margin: "4px 0 0",
        color: "#94a3b8",
        fontSize: "10px",
        lineHeight: "1.5",
    },


    browseButton: {
        position: "relative",
        overflow: "hidden",
        padding: "8px 12px",
        borderRadius: "7px",
        backgroundColor: "#ffffff",
        border: "1px solid #dbe2ea",
        color: "#2563eb",
        fontSize: "11px",
        fontWeight: "650",
        cursor: "pointer",
    },


    fileInput: {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity: 0,
        cursor: "pointer",
    },


    selectedFile: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#eff6ff",
        border: "1px solid #bfdbfe",
        padding: "10px 12px",
        borderRadius: "8px",
        marginTop: "9px",
        fontSize: "11px",
    },


    selectedLeft: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        color: "#1e40af",
    },


    fileIcon: {
        width: "25px",
        height: "25px",
        borderRadius: "6px",
        backgroundColor: "#dbeafe",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#2563eb",
        fontWeight: "700",
    },


    fileSize: {
        display: "block",
        color: "#64748b",
        fontSize: "9px",
        marginTop: "2px",
    },


    removeFile: {
        border: "none",
        backgroundColor: "transparent",
        color: "#dc2626",
        cursor: "pointer",
        fontSize: "10px",
        fontWeight: "600",
    },


    aiBox: {
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
        background:
            "linear-gradient(135deg, #f5f3ff, #eff6ff)",
        border: "1px solid #ddd6fe",
        borderRadius: "9px",
        padding: "14px",
        marginTop: "22px",
    },


    aiIcon: {
        width: "30px",
        height: "30px",
        borderRadius: "8px",
        backgroundColor: "#ffffff",
        color: "#6366f1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "16px",
        flexShrink: 0,
    },


    aiTitle: {
        color: "#4c1d95",
        fontSize: "12px",
    },


    aiText: {
        margin: "4px 0 0",
        color: "#6d28d9",
        fontSize: "10px",
        lineHeight: "1.5",
    },


    error: {
        backgroundColor: "#fef2f2",
        color: "#b91c1c",
        padding: "11px",
        borderRadius: "7px",
        marginTop: "13px",
        border: "1px solid #fecaca",
        fontSize: "11px",
    },


    submit: {
        width: "100%",
        padding: "13px",
        marginTop: "22px",
        background:
            "linear-gradient(135deg, #2563eb, #4f46e5)",
        color: "#ffffff",
        border: "none",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: "650",
        boxShadow:
            "0 5px 12px rgba(37, 99, 235, 0.2)",
    },


    infoPanel: {
        display: "flex",
        flexDirection: "column",
        gap: "15px",
    },


    infoCard: {
        background:
            "linear-gradient(145deg, #f8fbff, #f5f3ff)",
        border: "1px solid #e0e7ff",
        borderRadius: "13px",
        padding: "22px",
    },


    infoIcon: {
        width: "40px",
        height: "40px",
        borderRadius: "10px",
        backgroundColor: "#ffffff",
        color: "#4f46e5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
        marginBottom: "15px",
    },


    infoTitle: {
        margin: 0,
        color: "#0f172a",
        fontSize: "16px",
    },


    infoText: {
        color: "#64748b",
        fontSize: "11px",
        lineHeight: "1.6",
        margin: "7px 0 20px",
    },


    infoSteps: {
        display: "flex",
        flexDirection: "column",
        gap: "17px",
    },


    infoStep: {
        display: "flex",
        gap: "10px",
    },


    stepNumber: {
        width: "27px",
        height: "27px",
        borderRadius: "7px",
        backgroundColor: "#ffffff",
        color: "#2563eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "9px",
        fontWeight: "750",
        flexShrink: 0,
    },


    stepTitle: {
        display: "block",
        color: "#334155",
        fontSize: "11px",
    },


    stepText: {
        margin: "3px 0 0",
        color: "#94a3b8",
        fontSize: "9px",
        lineHeight: "1.4",
    },


    locationInfoCard: {
        display: "flex",
        gap: "11px",
        alignItems: "flex-start",
        backgroundColor: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: "11px",
        padding: "15px",
        color: "#166534",
    },


    locationInfoIcon: {
        fontSize: "18px",
    },


    tipCard: {
        display: "flex",
        gap: "10px",
        alignItems: "flex-start",
        backgroundColor: "#fffbeb",
        border: "1px solid #fde68a",
        borderRadius: "11px",
        padding: "15px",
    },


    tipIcon: {
        fontSize: "18px",
    },
};


export default NewComplaint;
