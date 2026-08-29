with open(r'D:\sih\frontend\src\pages\NewComplaint.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

split_marker_top = '        // Capture metadata & trigger auto GPS'
split_marker_bottom = '            {/* =================================================\n                SIDEBAR'

idx_top = content.find(split_marker_top)
idx_bottom = content.find(split_marker_bottom)

if idx_top == -1 or idx_bottom == -1:
    print(f"Error: Markers not found! idx_top={idx_top}, idx_bottom={idx_bottom}")
    exit(1)

middle = '''        // Capture metadata & trigger auto GPS
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
'''

new_content = content[:idx_top] + middle + '\n' + content[idx_bottom:]
with open(r'D:\sih\frontend\src\pages\NewComplaint.jsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully updated D:/sih/frontend/src/pages/NewComplaint.jsx!")
