import React, { useEffect, useRef, useState } from "react";

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const startCamera = async (mode) => {
    setLoading(true);
    setError("");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported on this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setLoading(false);
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Could not access camera. Please check permissions or attach a photo from your device.");
      setLoading(false);
    }
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedImage(dataUrl);
  };

  const confirmPhoto = () => {
    if (!capturedImage) return;
    fetch(capturedImage)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `live-evidence-${Date.now()}.jpg`, { type: "image/jpeg" });
        onCapture(file);
      })
      .catch(() => {
        alert("Failed to process photo");
      });
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const handleFallbackUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      onCapture(e.target.files[0]);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.85)",
      zIndex: 1100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      backdropFilter: "blur(6px)"
    }}>
      <div style={{
        background: "#17191C",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "20px",
        maxWidth: "640px",
        width: "100%",
        padding: "24px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.6)"
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 800, color: "#FFD21F", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              LIVE WEBCAM STREAM
            </div>
            <h3 style={{ fontSize: "16px", color: "#F5F5F2", margin: "2px 0 0", fontWeight: 800 }}>
              Capture Live Field Evidence
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "none",
              color: "#8F9499",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            ✕
          </button>
        </div>

        {error ? (
          <div style={{ textAlign: "center", padding: "30px 10px" }}>
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>📸</div>
            <p style={{ color: "#FF5C5C", fontSize: "12px", marginBottom: "16px" }}>{error}</p>
            <label style={{
              background: "#FFD21F",
              color: "#0B0D0F",
              padding: "10px 20px",
              borderRadius: "8px",
              fontWeight: 800,
              fontSize: "12px",
              cursor: "pointer",
              display: "inline-block"
            }}>
              📁 Browse Photo from Device
              <input type="file" accept="image/*" capture="environment" onChange={handleFallbackUpload} style={{ display: "none" }} />
            </label>
          </div>
        ) : (
          <div>
            {/* Viewfinder Window */}
            <div style={{
              position: "relative",
              width: "100%",
              height: "360px",
              background: "#0B0D0F",
              borderRadius: "14px",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255, 255, 255, 0.08)"
            }}>
              {/* REC Badge */}
              <div style={{
                position: "absolute",
                top: "14px",
                left: "14px",
                background: "rgba(0, 0, 0, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "999px",
                padding: "4px 10px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                zIndex: 10
              }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FF5C5C", boxShadow: "0 0 8px #FF5C5C" }} />
                <span style={{ fontSize: "10px", fontWeight: 800, color: "#F5F5F2", letterSpacing: "0.05em" }}>LIVE REC</span>
              </div>

              {capturedImage ? (
                <img src={capturedImage} alt="Captured" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : (
                <>
                  <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {/* Viewfinder Crosshair */}
                  <div style={{
                    position: "absolute",
                    border: "2px dashed rgba(255, 210, 31, 0.4)",
                    borderRadius: "12px",
                    width: "75%",
                    height: "75%",
                    pointerEvents: "none"
                  }} />
                </>
              )}
            </div>

            {/* Controls Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "18px" }}>
              {!capturedImage ? (
                <>
                  <button
                    onClick={toggleCamera}
                    type="button"
                    style={{
                      background: "#1D2023",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#F5F5F2",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    🔄 Flip Camera
                  </button>

                  <button
                    onClick={takePhoto}
                    type="button"
                    style={{
                      background: "#FFD21F",
                      color: "#0B0D0F",
                      border: "none",
                      fontSize: "14px",
                      fontWeight: 900,
                      padding: "10px 24px",
                      borderRadius: "999px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 0 16px rgba(255, 210, 31, 0.35)"
                    }}
                  >
                    📸 Capture Evidence
                  </button>

                  <label style={{
                    background: "#1D2023",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#8F9499",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}>
                    📁 File
                    <input type="file" accept="image/*" onChange={handleFallbackUpload} style={{ display: "none" }} />
                  </label>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setCapturedImage(null)}
                    type="button"
                    style={{
                      background: "#1D2023",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#F5F5F2",
                      padding: "10px 18px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    🔄 Retake
                  </button>

                  <button
                    onClick={confirmPhoto}
                    type="button"
                    style={{
                      background: "#A8E063",
                      color: "#0B0D0F",
                      border: "none",
                      padding: "10px 24px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 900,
                      cursor: "pointer",
                      boxShadow: "0 0 16px rgba(168, 224, 99, 0.3)"
                    }}
                  >
                    ✓ Use This Evidence →
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
