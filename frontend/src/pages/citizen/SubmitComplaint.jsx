import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import complaintService from "../../services/complaintService";
import evidenceService from "../../services/evidenceService";
import aiService from "../../services/aiService";
import LocationPicker from "../../components/map/LocationPicker";
import FileUploader from "../../components/evidence/FileUploader";
import CameraCapture from "../../components/evidence/CameraCapture";

const activeAiCategories = [
  { value: "GENERAL / AUTO DETECT", label: "✨ GENERAL / AUTO DETECT (AI Recommended)" },
  { value: "Pothole", label: "🕳️ Pothole (Roads & Infrastructure)" },
  { value: "Garbage", label: "🗑️ Garbage (Sanitation & Waste)" },
  { value: "Broken Streetlight", label: "💡 Broken Streetlight (Electrical & Public Lighting)" },
  { value: "Fallen Tree", label: "🌳 Fallen Tree (Environment & Emergency Clearance)" }
];

const futureComingSoonCategories = [
  { value: "Clean Energy & Solar", label: "☀️ Clean Energy & Solar — AVAILABLE SOON" },
  { value: "Water Management", label: "💧 Water Management — AVAILABLE SOON" },
  { value: "Traffic & Road Safety", label: "🚦 Traffic & Road Safety — AVAILABLE SOON" },
  { value: "Air Pollution", label: "🌫️ Air Pollution — AVAILABLE SOON" },
  { value: "Public Health", label: "🏥 Public Health — AVAILABLE SOON" }
];

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const [form, setForm] = useState({
    title: "",
    description: "",
    desiredEngineeringOutcome: "",
    category: "Pending AI Verification",
    citizenSuggestedCategory: "GENERAL / AUTO DETECT",
    subCategory: "",
    challengeType: "Societal Problem Statement",
    priority: "HIGH",
    affectedPopulation: 1200,
    expectedImpact: "",
    contactPhone: "+91 ",
    landmark: "",
    latitude: null,
    longitude: null,
    address: "",
    villageCity: "",
    blockTehsil: "",
    district: "",
    state: ""
  });

  const [files, setFiles] = useState([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [aiCameraOpen, setAiCameraOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  // AI Detail Filling states: 'AI_DETAIL_IDLE' | 'AI_VERIFYING' | 'AI_GENERATING' | 'AI_READY' | 'AI_REJECTED' | 'AI_ERROR'
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiAssistantState, setAiAssistantState] = useState("AI_DETAIL_IDLE");
  const [aiGeneratedData, setAiGeneratedData] = useState(null);
  const [aiAssistantError, setAiAssistantError] = useState("");
  const [aiVariation, setAiVariation] = useState(0);
  const [aiSourceFile, setAiSourceFile] = useState(null);

  const handleAiDetailFile = async (file) => {
    if (!file || !file.type?.startsWith("image/")) {
      setAiAssistantError("Please select a valid photograph (JPG, PNG, WebP).");
      setAiAssistantState("AI_REJECTED");
      return;
    }

    setAiSourceFile(file);
    setAiAssistantState("AI_VERIFYING");
    setAiAssistantError("");
    setAiGeneratedData(null);

    const locItems = [form.address, form.villageCity, form.district, form.state].filter((s) => s && s.trim().length > 0).map((s) => s.trim());
    const locationStr = form.address?.trim() || (locItems.length > 0 ? locItems.join(", ") : "");

    try {
      setAiAssistantState("AI_GENERATING");
      const res = await aiService.generateComplaintDetails(file, locationStr, form.description, 0);

      if (res && res.valid === true && res.details) {
        setAiGeneratedData(res);
        setAiAssistantState("AI_READY");
        setAiVariation(0);
      } else {
        setAiAssistantState("AI_REJECTED");
        setAiAssistantError(res?.message || "AI could not verify a supported civic issue with sufficient confidence. Please upload a clear photo of the civic defect.");
      }
    } catch (e) {
      console.error("AI detail generation failed:", e);
      setAiAssistantState("AI_ERROR");
      setAiAssistantError("AI detail generation is currently unavailable. Please enter the complaint details manually.");
    }
  };

  const handleRegenerateDetails = async () => {
    if (!aiSourceFile) return;
    const nextVar = (aiVariation + 1) % 3;
    setAiVariation(nextVar);
    setAiAssistantState("AI_GENERATING");

    const locItems = [form.address, form.villageCity, form.district, form.state].filter((s) => s && s.trim().length > 0).map((s) => s.trim());
    const locationStr = form.address?.trim() || (locItems.length > 0 ? locItems.join(", ") : "");

    try {
      const res = await aiService.generateComplaintDetails(aiSourceFile, locationStr, form.description, nextVar);
      if (res && res.valid === true && res.details) {
        setAiGeneratedData(res);
        setAiAssistantState("AI_READY");
      } else {
        setAiAssistantState("AI_READY");
      }
    } catch (e) {
      setAiAssistantState("AI_READY");
    }
  };

  const handleApplyAiDetails = () => {
    if (!aiGeneratedData || !aiGeneratedData.details) return;
    const { title, description, desired_engineering_outcome } = aiGeneratedData.details;
    if (title) update("title", title);
    if (description) update("description", description);
    if (desired_engineering_outcome) {
      update("desiredEngineeringOutcome", desired_engineering_outcome);
      update("expectedImpact", desired_engineering_outcome);
    }
    if (aiGeneratedData.category) {
      update("category", aiGeneratedData.category);
    }
    if (aiGeneratedData.detected_class) {
      const foundCat = activeAiCategories.find((c) => c.value.toLowerCase().includes(aiGeneratedData.detected_class.replace(/_/g, " ")));
      if (foundCat) {
        update("citizenSuggestedCategory", foundCat.value);
      }
    }

    // Attach verified file to files queue so user does not need to re-upload
    if (aiSourceFile) {
      aiSourceFile._analyzing = false;
      aiSourceFile._aiValid = true;
      aiSourceFile._aiResult = aiGeneratedData;
      setFiles((prev) => {
        const already = prev.some((f) => f.name === aiSourceFile.name && f.size === aiSourceFile.size);
        if (!already) return [aiSourceFile, ...prev];
        return prev;
      });
    }

    setAiAssistantOpen(false);
  };

  const update = (key, value) => {
    setForm((old) => ({
      ...old,
      [key]: value
    }));
  };

  const handleNext = () => {
    setError("");
    if (currentStep === 1) {
      if (!form.title.trim() || form.title.trim().length < 5) {
        setError("Please enter a descriptive challenge title (at least 5 characters).");
        return;
      }
      if (!form.description.trim() || form.description.trim().length < 15) {
        setError("Please provide problem details (at least 15 characters).");
        return;
      }
    }
    if (currentStep === 2) {
      if (!form.latitude || !form.longitude) {
        setError("Please select the problem location on the Leaflet map.");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setError("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const submit = async (event) => {
    if (event) event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const complaint = await complaintService.create({
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        desiredEngineeringOutcome: (form.desiredEngineeringOutcome || form.expectedImpact || "").trim(),
        expectedImpact: (form.desiredEngineeringOutcome || form.expectedImpact || "").trim(),
        category: form.citizenSuggestedCategory || "Pending AI Verification",
        citizenSuggestedCategory: form.citizenSuggestedCategory || null,
        address: form.address.trim()
      });

      let updatedComplaint = complaint;

      if (files.length && complaint?.id) {
        try {
          await evidenceService.upload(
            complaint.id,
            files,
            (pct) => setProgress(pct),
            {
              latitude: form.latitude,
              longitude: form.longitude,
              description: "Field survey evidence for " + form.title
            }
          );
          // Fetch refreshed complaint containing authoritative AI classification
          try {
            const fresh = await complaintService.getById(complaint.id);
            if (fresh) updatedComplaint = fresh;
          } catch (_) {}
        } catch (evErr) {
          console.warn("Evidence upload notice:", evErr);
        }
      }

      setSubmittedComplaint(updatedComplaint);
    } catch (err) {
      console.error("Submission failed:", err);
      setError(err?.response?.data?.message || err.message || "Failed to submit challenge. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: "01 PROBLEM", icon: "📝" },
    { num: 2, label: "02 LOCATION", icon: "📍" },
    { num: 3, label: "03 EVIDENCE", icon: "📷" },
    { num: 4, label: "04 REVIEW", icon: "✓" }
  ];

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "10px", fontWeight: 800, color: "#FFD21F", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
          NATIONAL PROBLEM-SOLVING REPOSITORY
        </div>
        <h1 style={{ fontSize: "26px", fontWeight: 900, color: "#F5F5F2", margin: "2px 0 6px", letterSpacing: "-0.02em" }}>
          Report a Societal Challenge
        </h1>
        <p style={{ fontSize: "13px", color: "#8F9499", margin: 0 }}>
          Submit local infrastructure, water, agriculture, or energy problems for government verification and university R&D.
        </p>
      </div>

      {/* 4-STEP STEPPER */}
      <div style={{
        background: "#17191C",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "16px",
        padding: "16px 20px",
        marginBottom: "24px",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "10px"
      }}>
        {steps.map((s) => {
          const isDone = s.num < currentStep;
          const isCurrent = s.num === currentStep;

          return (
            <div
              key={s.num}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 12px",
                borderRadius: "10px",
                background: isCurrent ? "#1D2023" : "transparent",
                border: isCurrent ? "1px solid rgba(255, 210, 31, 0.35)" : "1px solid transparent"
              }}
            >
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: isCurrent ? "#FFD21F" : isDone ? "#A8E063" : "#222528",
                color: isCurrent || isDone ? "#0B0D0F" : "#8F9499",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 900,
                flexShrink: 0
              }}>
                {isDone ? "✓" : s.num}
              </div>
              <div style={{
                fontSize: "11px",
                fontWeight: isCurrent ? 850 : 600,
                color: isCurrent ? "#FFD21F" : isDone ? "#A8E063" : "#8F9499",
                letterSpacing: "0.04em"
              }}>
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div style={{
          background: "rgba(255, 92, 92, 0.12)",
          border: "1px solid rgba(255, 92, 92, 0.3)",
          color: "#FF5C5C",
          padding: "12px 16px",
          borderRadius: "12px",
          marginBottom: "20px",
          fontSize: "13px",
          fontWeight: 700
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* FORM CONTAINER */}
      <div style={{
        background: "#17191C",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "20px",
        padding: "28px",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.35)"
      }}>
        
        {/* STEP 1: PROBLEM DETAILS */}
        {currentStep === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <h2 style={{ fontSize: "16px", color: "#F5F5F2", margin: 0, fontWeight: 800 }}>
              01 • Problem Description & Domain
            </h2>

            {/* AI ASSISTED DETAIL FILLING CARD */}
            <div style={{
              background: "linear-gradient(135deg, rgba(255, 210, 31, 0.08) 0%, rgba(56, 189, 248, 0.08) 100%)",
              border: "1px solid rgba(255, 210, 31, 0.3)",
              borderRadius: "14px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "20px" }}>🤖</span>
                  <div>
                    <strong style={{ fontSize: "13px", color: "#FFD21F", display: "block" }}>
                      AI-Assisted Complaint Detail Filling
                    </strong>
                    <span style={{ fontSize: "11px", color: "#8F9499" }}>
                      Let AI verify your photo and prepare the challenge title, detailed problem description, and desired outcome for you.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAiAssistantOpen(!aiAssistantOpen);
                    if (!aiAssistantOpen && aiAssistantState === "AI_DETAIL_IDLE") {
                      setAiAssistantError("");
                    }
                  }}
                  style={{
                    background: aiAssistantOpen ? "#1D2023" : "#FFD21F",
                    color: aiAssistantOpen ? "#FFD21F" : "#0B0D0F",
                    border: aiAssistantOpen ? "1px solid #FFD21F" : "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <span>✨</span>
                  <span>{aiAssistantOpen ? "Close AI Assistant" : "Details can be filled by AI"}</span>
                </button>
              </div>

              {aiAssistantOpen && (
                <div style={{
                  background: "#16181A",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px"
                }}>
                  <div style={{ fontSize: "12px", color: "#F5F5F2", fontWeight: 700 }}>
                    📷 Upload or capture a clear photo of the civic problem:
                  </div>

                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <label style={{
                      background: "#1D2023",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#F5F5F2",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 750,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      <span>📁 Choose Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleAiDetailFile(f);
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setAiCameraOpen(true)}
                      style={{
                        background: "#1D2023",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        color: "#F5F5F2",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 750,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      <span>📸 Live Camera</span>
                    </button>
                  </div>

                  {aiCameraOpen && (
                    <CameraCapture
                      onCapture={(file) => {
                        setAiCameraOpen(false);
                        handleAiDetailFile(file);
                      }}
                      onClose={() => setAiCameraOpen(false)}
                    />
                  )}

                  {/* REAL-TIME STATUS DISPLAY */}
                  {aiAssistantState === "AI_VERIFYING" && (
                    <div style={{ background: "rgba(255, 210, 31, 0.1)", border: "1px solid rgba(255, 210, 31, 0.3)", borderRadius: "8px", padding: "12px", color: "#FFD21F", fontSize: "12px", fontWeight: 750, display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>⏳</span>
                      <span>Verifying civic evidence (Safety Filter & Real YOLO Vision)...</span>
                    </div>
                  )}

                  {aiAssistantState === "AI_GENERATING" && (
                    <div style={{ background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: "8px", padding: "12px", color: "#38BDF8", fontSize: "12px", fontWeight: 750, display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>🤖</span>
                      <span>Generating problem details and desired engineering outcome...</span>
                    </div>
                  )}

                  {aiAssistantState === "AI_REJECTED" && (
                    <div style={{ background: "rgba(255, 92, 92, 0.1)", border: "1px solid rgba(255, 92, 92, 0.35)", borderRadius: "8px", padding: "12px", color: "#FFA2A2", fontSize: "12px", fontWeight: 700, display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>⚠️</span>
                        <span>AI could not verify a supported civic issue.</span>
                      </div>
                      <div style={{ fontSize: "11px", color: "#FF8E8E" }}>
                        {aiAssistantError || "Please upload a clear photograph of a supported civic problem (pothole, garbage, broken streetlight, or fallen tree)."}
                      </div>
                    </div>
                  )}

                  {aiAssistantState === "AI_ERROR" && (
                    <div style={{ background: "rgba(255, 142, 0, 0.1)", border: "1px solid rgba(255, 142, 0, 0.35)", borderRadius: "8px", padding: "12px", color: "#FFB067", fontSize: "12px", fontWeight: 700 }}>
                      ⚠️ {aiAssistantError || "AI detail generation is currently unavailable. Please enter the complaint details manually."}
                    </div>
                  )}

                  {aiAssistantState === "AI_READY" && aiGeneratedData && aiGeneratedData.details && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
                      {/* Telemetry Header */}
                      <div style={{ background: "rgba(52, 211, 153, 0.12)", border: "1px solid rgba(52, 211, 153, 0.35)", borderRadius: "8px", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ color: "#34D399", fontWeight: 900 }}>✓ CIVIC ISSUE VERIFIED:</span>
                          <span style={{ color: "#F5F5F2", fontWeight: 800, textTransform: "uppercase" }}>
                            {aiGeneratedData.detected_class?.replace(/_/g, " ")} ({aiGeneratedData.detected_confidence}% conf)
                          </span>
                        </div>
                        <div style={{ fontSize: "11px", color: "#A7F3D0" }}>
                          Category: {aiGeneratedData.category} • Dept: {aiGeneratedData.recommended_department}
                        </div>
                      </div>

                      {/* Generated Fields Preview */}
                      <div style={{ background: "#1D2023", borderRadius: "8px", padding: "12px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div>
                          <span style={{ fontSize: "10px", fontWeight: 800, color: "#FFD21F" }}>AI GENERATED TITLE</span>
                          <div style={{ fontSize: "13px", color: "#F5F5F2", fontWeight: 750, marginTop: "2px" }}>
                            {aiGeneratedData.details.title}
                          </div>
                        </div>

                        <div>
                          <span style={{ fontSize: "10px", fontWeight: 800, color: "#8F9499" }}>AI GENERATED DESCRIPTION</span>
                          <div style={{ fontSize: "12px", color: "#D1D5DB", lineHeight: 1.4, marginTop: "2px" }}>
                            {aiGeneratedData.details.description}
                          </div>
                        </div>

                        <div>
                          <span style={{ fontSize: "10px", fontWeight: 800, color: "#38BDF8" }}>AI DESIRED ENGINEERING OUTCOME</span>
                          <div style={{ fontSize: "12px", color: "#D1D5DB", lineHeight: 1.4, marginTop: "2px" }}>
                            {aiGeneratedData.details.desired_engineering_outcome}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={handleRegenerateDetails}
                          style={{
                            background: "#1D2023",
                            border: "1px solid rgba(255,255,255,0.2)",
                            color: "#F5F5F2",
                            padding: "8px 14px",
                            borderRadius: "6px",
                            fontSize: "11.5px",
                            fontWeight: 750,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px"
                          }}
                        >
                          <span>🔄</span>
                          <span>Regenerate Phrasing</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleApplyAiDetails}
                          style={{
                            background: "#34D399",
                            color: "#0B0D0F",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            fontSize: "11.5px",
                            fontWeight: 850,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            boxShadow: "0 0 12px rgba(52, 211, 153, 0.3)"
                          }}
                        >
                          <span>✓</span>
                          <span>Use These Details</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 750, color: "#8F9499", display: "block", marginBottom: "6px" }}>
                Challenge Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Large Pothole Causing Road Safety Hazard"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: "#1D2023",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "10px",
                  color: "#F5F5F2",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* AI-First Classification Banner */}
            <div style={{
              background: "rgba(56, 189, 248, 0.08)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              borderRadius: "12px",
              padding: "14px 16px",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px"
            }}>
              <span style={{ fontSize: "20px" }}>🤖</span>
              <div>
                <strong style={{ fontSize: "12.5px", color: "#38BDF8", display: "block", marginBottom: "2px" }}>
                  AI-First Automated Classification & Routing
                </strong>
                <p style={{ fontSize: "11.5px", color: "#8F9499", margin: 0, lineHeight: 1.4 }}>
                  You are not required to pick a domain. The <strong>Adhikar YOLO Deep Learning Model</strong> will analyze your evidence photos/videos upon submission to automatically derive the verified defect class, category, and recommended government department.
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 750, color: "#8F9499", display: "block", marginBottom: "6px" }}>
                  Civic Category / Context (Optional)
                </label>
                <select
                  value={form.citizenSuggestedCategory || "GENERAL / AUTO DETECT"}
                  onChange={(e) => update("citizenSuggestedCategory", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "#1D2023",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "10px",
                    color: "#F5F5F2",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                >
                  <optgroup label="CURRENT AI-SUPPORTED (Adhikar YOLO26n)">
                    {activeAiCategories.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="MORE CIVIC CATEGORIES (AI SUPPORT COMING SOON)">
                    {futureComingSoonCategories.map((c) => (
                      <option key={c.value} value={c.value} disabled style={{ color: "#64748B" }}>
                        {c.label}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <span style={{ fontSize: "10px", color: "#8F9499", display: "block", marginTop: "4px" }}>
                  * GENERAL / AUTO DETECT is active. The actual YOLO model derives the authoritative category.
                </span>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 750, color: "#8F9499", display: "block", marginBottom: "6px" }}>
                  Estimated Severity Level *
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => update("priority", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "#1D2023",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "10px",
                    color: "#F5F5F2",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                >
                  <option value="CRITICAL">🔴 Critical (Immediate health/safety hazard)</option>
                  <option value="HIGH">🟡 High (Severe daily community impact)</option>
                  <option value="MEDIUM">🟠 Medium (Substantial civic inefficiency)</option>
                  <option value="LOW">🟢 Low (General local improvement)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 750, color: "#8F9499", display: "block", marginBottom: "6px" }}>
                Detailed Problem Description *
              </label>
              <textarea
                rows={4}
                placeholder="Explain the background, frequency, who is impacted, and previous attempts to solve..."
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: "#1D2023",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "10px",
                  color: "#F5F5F2",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit"
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 750, color: "#8F9499", display: "block", marginBottom: "6px" }}>
                Desired Engineering Outcome / Impact (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Specify what technical or municipal outcome should be achieved (e.g. durable asphalt resurfacing, luminaire replacement)..."
                value={form.desiredEngineeringOutcome || form.expectedImpact}
                onChange={(e) => {
                  update("desiredEngineeringOutcome", e.target.value);
                  update("expectedImpact", e.target.value);
                }}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: "#1D2023",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "10px",
                  color: "#F5F5F2",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit"
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 750, color: "#8F9499", display: "block", marginBottom: "6px" }}>
                  Estimated Affected Population (Citizens)
                </label>
                <input
                  type="number"
                  value={form.affectedPopulation}
                  onChange={(e) => update("affectedPopulation", Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "#1D2023",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "10px",
                    color: "#F5F5F2",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION */}
        {currentStep === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <h2 style={{ fontSize: "16px", color: "#F5F5F2", margin: 0, fontWeight: 800 }}>
              02 • Geotag Location & Address
            </h2>

            <LocationPicker
              value={{ latitude: form.latitude, longitude: form.longitude }}
              onChange={(loc) => {
                setForm(prev => ({
                  ...prev,
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                  ...(loc.address ? { address: loc.address } : {}),
                  ...(loc.district ? { district: loc.district } : {}),
                  ...(loc.state ? { state: loc.state } : {}),
                  ...(loc.villageCity ? { villageCity: loc.villageCity } : {})
                }));
              }}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 750, color: "#8F9499", display: "block", marginBottom: "6px" }}>
                  Specific Address / Landmark *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Community Center, Ward 12"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "#1D2023",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "10px",
                    color: "#F5F5F2",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 750, color: "#8F9499", display: "block", marginBottom: "6px" }}>
                  District & State
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <input
                    type="text"
                    value={form.district}
                    onChange={(e) => update("district", e.target.value)}
                    placeholder="District"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      background: "#1D2023",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "10px",
                      color: "#F5F5F2",
                      fontSize: "13px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                    placeholder="State"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      background: "#1D2023",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "10px",
                      color: "#F5F5F2",
                      fontSize: "13px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: EVIDENCE */}
        {currentStep === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "16px", color: "#F5F5F2", margin: 0, fontWeight: 800 }}>
                03 • Evidence & Live Photos
              </h2>
              <button
                type="button"
                onClick={() => setCameraOpen(true)}
                style={{
                  background: "#FFD21F",
                  color: "#0B0D0F",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                📸 Open Live Camera
              </button>
            </div>

            <FileUploader
              files={files}
              setFiles={setFiles}
              maxFiles={8}
              onAiDetected={(aiData) => {
                if (aiData?.detected_category) {
                  update("category", aiData.detected_category);
                }
                if (aiData?.detected_severity) {
                  update("priority", aiData.detected_severity);
                }
              }}
            />

            {cameraOpen && (
              <CameraCapture
                onCapture={async (file) => {
                  file._analyzing = true;
                  file._aiResult = null;
                  file._aiValid = undefined;
                  setFiles((prev) => [...prev, file]);
                  setCameraOpen(false);

                  try {
                    const aiData = await aiService.validateImage(file);
                    file._aiResult = aiData;
                    file._aiValid = aiData?.valid === true;
                    file._analyzing = false;
                    if (aiData?.valid === true) {
                      if (aiData.detected_category) {
                        update("category", aiData.detected_category);
                      }
                      if (aiData.detected_severity) {
                        update("priority", aiData.detected_severity);
                      }
                    }
                  } catch (e) {
                    file._analyzing = false;
                    file._aiValid = false;
                    file._aiResult = {
                      valid: false,
                      stage: "SERVICE_UNAVAILABLE",
                      error_type: "AI_VALIDATION_UNAVAILABLE",
                      message: "AI validation is temporarily unavailable. Please try again."
                    };
                  }
                  setFiles((prev) => [...prev]);
                }}
                onClose={() => setCameraOpen(false)}
              />
            )}
          </div>
        )}

        {/* STEP 4: REVIEW & SUBMIT */}
        {currentStep === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <h2 style={{ fontSize: "16px", color: "#F5F5F2", margin: 0, fontWeight: 800 }}>
              04 • Review Challenge Specification
            </h2>

            <div style={{ background: "#1D2023", borderRadius: "14px", padding: "18px", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <span style={{ fontSize: "10px", fontWeight: 800, color: "#FFD21F", textTransform: "uppercase" }}>TITLE</span>
                <div style={{ fontSize: "16px", fontWeight: 850, color: "#F5F5F2" }}>{form.title}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>CATEGORY</span>
                  <div style={{ fontSize: "13px", color: "#F5F5F2", fontWeight: 700 }}>{form.category}</div>
                </div>
                <div>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>PRIORITY SEVERITY</span>
                  <div style={{ fontSize: "13px", color: form.priority === "CRITICAL" ? "#FF5C5C" : "#FFD21F", fontWeight: 800 }}>● {form.priority}</div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: "10px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>DESCRIPTION</span>
                <div style={{ fontSize: "12px", color: "#8F9499", lineHeight: 1.4 }}>{form.description}</div>
              </div>

              {(form.desiredEngineeringOutcome || form.expectedImpact) && (
                <div>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: "#38BDF8", textTransform: "uppercase" }}>DESIRED ENGINEERING OUTCOME</span>
                  <div style={{ fontSize: "12px", color: "#BAE6FD", lineHeight: 1.4 }}>{form.desiredEngineeringOutcome || form.expectedImpact}</div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>LOCATION</span>
                  <div style={{ fontSize: "12px", color: "#F5F5F2" }}>{form.address} ({form.district}, {form.state})</div>
                  <div style={{ fontSize: "10px", color: "#FFD21F" }}>📍 Lat: {form.latitude}, Lng: {form.longitude}</div>
                </div>
                <div>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>EVIDENCE FILES</span>
                  <div style={{ fontSize: "12px", color: "#F5F5F2" }}>{files.length} attachment(s) queued</div>
                </div>
              </div>

              {files.some((f) => f._aiValid === false) && (
                <div style={{ background: "rgba(255, 92, 92, 0.12)", border: "1px solid rgba(255, 92, 92, 0.35)", borderRadius: "10px", padding: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "18px" }}>⚠️</span>
                  <div style={{ fontSize: "12px", color: "#FFA2A2", fontWeight: 700 }}>
                    One or more uploaded photos failed the AI Intake Gate (selfie, unclear, or non-civic). Please remove rejected images before submitting.
                  </div>
                </div>
              )}
            </div>

            {loading && progress > 0 && (
              <div style={{ background: "#1D2023", padding: "12px", borderRadius: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                  <span style={{ color: "#F5F5F2" }}>Uploading evidence telemetry...</span>
                  <span style={{ color: "#FFD21F", fontWeight: 800 }}>{progress}%</span>
                </div>
                <div style={{ height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ width: `${progress}%`, height: "100%", background: "#FFD21F" }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* BOTTOM STEP CONTROLS */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", paddingTop: "18px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              disabled={loading}
              style={{
                background: "#1D2023",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#F5F5F2",
                padding: "10px 20px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 750,
                cursor: "pointer"
              }}
            >
              ← Previous Step
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              style={{
                background: "#FFD21F",
                color: "#0B0D0F",
                border: "none",
                padding: "10px 24px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 900,
                cursor: "pointer",
                boxShadow: "0 0 14px rgba(255, 210, 31, 0.25)"
              }}
            >
              Next: {steps[currentStep].label} →
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={loading || files.some((f) => f._analyzing) || files.some((f) => f._aiValid === false)}
              style={{
                background: (files.some((f) => f._analyzing) || files.some((f) => f._aiValid === false)) ? "#3D4148" : "#FFD21F",
                color: (files.some((f) => f._analyzing) || files.some((f) => f._aiValid === false)) ? "#8F9499" : "#0B0D0F",
                border: "none",
                padding: "12px 28px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 900,
                cursor: (files.some((f) => f._analyzing) || files.some((f) => f._aiValid === false)) ? "not-allowed" : "pointer",
                boxShadow: (files.some((f) => f._analyzing) || files.some((f) => f._aiValid === false)) ? "none" : "0 0 18px rgba(255, 210, 31, 0.35)"
              }}
            >
              {loading ? "Submitting Challenge..." : files.some((f) => f._analyzing) ? "⏳ Analyzing Evidence..." : files.some((f) => f._aiValid === false) ? "⚠️ Remove Rejected Photos" : "🚀 Submit Challenge to National Grid"}
            </button>
          )}
        </div>

      </div>

      {/* SUBMISSION SUCCESS CONFIRMATION MODAL */}
      {submittedComplaint && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.88)",
          zIndex: 1200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          backdropFilter: "blur(8px)"
        }}>
          <div style={{
            background: "#17191C",
            border: "1px solid rgba(255, 210, 31, 0.4)",
            borderRadius: "24px",
            maxWidth: "600px",
            width: "100%",
            padding: "32px",
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.85)",
            textAlign: "center"
          }}>
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "rgba(255, 210, 31, 0.15)",
              border: "2px solid #FFD21F",
              color: "#FFD21F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              margin: "0 auto 16px",
              boxShadow: "0 0 24px rgba(255, 210, 31, 0.35)"
            }}>
              ✓
            </div>

            <span style={{ fontSize: "11px", fontWeight: 800, color: "#FFD21F", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              CIVIC CHALLENGE REGISTERED
            </span>

            <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#F5F5F2", margin: "6px 0 10px", letterSpacing: "-0.02em" }}>
              Challenge Registered Successfully
            </h2>

            <p style={{ fontSize: "13px", color: "#8F9499", margin: "0 0 20px", lineHeight: 1.5 }}>
              Your problem statement has been permanently recorded in the National Repository and routed to the Government Moderation Queue for institutional matching.
            </p>

            {/* METADATA SUMMARY CARD */}
            <div style={{
              background: "#111315",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "14px",
              padding: "16px 20px",
              marginBottom: "20px",
              textAlign: "left",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px"
            }}>
              <div>
                <div style={{ fontSize: "10.5px", color: "#8F9499", textTransform: "uppercase", fontWeight: 700 }}>Challenge ID</div>
                <div style={{ fontSize: "15px", fontWeight: 900, color: "#FFD21F", marginTop: "2px" }}>#{submittedComplaint.id}</div>
              </div>
              <div>
                <div style={{ fontSize: "10.5px", color: "#8F9499", textTransform: "uppercase", fontWeight: 700 }}>Lifecycle Status</div>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#A8E063", marginTop: "2px" }}>● {submittedComplaint.status || "SUBMITTED"}</div>
              </div>
              <div>
                <div style={{ fontSize: "10.5px", color: "#8F9499", textTransform: "uppercase", fontWeight: 700 }}>Evidence Attached</div>
                <div style={{ fontSize: "12.5px", fontWeight: 750, color: "#F5F5F2", marginTop: "2px" }}>
                  {files.length > 0 ? `✓ ${files.length} File(s) Uploaded` : "✓ GPS Verified"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "10.5px", color: "#8F9499", textTransform: "uppercase", fontWeight: 700 }}>Location Coordinates</div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#38BDF8", marginTop: "2px" }}>
                  📍 {form.latitude?.toFixed(4)}, {form.longitude?.toFixed(4)}
                </div>
              </div>
            </div>

            {/* LIFECYCLE ROADMAP */}
            <div style={{
              background: "#1D2023",
              borderRadius: "12px",
              padding: "12px 16px",
              marginBottom: "24px",
              fontSize: "11.5px",
              color: "#8F9499",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span style={{ color: "#FFD21F", fontWeight: 800 }}>1. Government Audit</span>
              <span>→</span>
              <span>2. University Matching</span>
              <span>→</span>
              <span>3. Engineering R&D</span>
              <span>→</span>
              <span>4. Field Impact</span>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                type="button"
                onClick={() => navigate(`/citizen/complaints/${submittedComplaint.id}`)}
                style={{
                  width: "100%",
                  background: "#FFD21F",
                  color: "#0B0D0F",
                  border: "none",
                  padding: "14px 28px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 900,
                  cursor: "pointer",
                  boxShadow: "0 0 20px rgba(255, 210, 31, 0.4)",
                  letterSpacing: "0.02em"
                }}
              >
                ✓ VIEW MY SUBMISSION CASEFILE →
              </button>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => navigate("/citizen/complaints")}
                  style={{
                    background: "#1D2023",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#F5F5F2",
                    padding: "11px 16px",
                    borderRadius: "10px",
                    fontSize: "12.5px",
                    fontWeight: 800,
                    cursor: "pointer"
                  }}
                >
                  📋 My Submissions
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/citizen")}
                  style={{
                    background: "#1D2023",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#F5F5F2",
                    padding: "11px 16px",
                    borderRadius: "10px",
                    fontSize: "12.5px",
                    fontWeight: 800,
                    cursor: "pointer"
                  }}
                >
                  📊 Citizen Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
