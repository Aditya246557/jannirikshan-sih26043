import API from "./api";

const unwrap = (res) => (res && res.data !== undefined ? res.data : res);

export function normalizeAiValidationResponse(response) {
    if (!response) {
        return {
            success: false,
            valid: false,
            stage: "ERROR",
            status: "INVALID_RESPONSE",
            errorType: "INVALID_RESPONSE",
            error_type: "INVALID_RESPONSE",
            message: "No response received from AI service",
            detectedClass: null,
            detected_class: null,
            detectedConfidence: null,
            detected_confidence: null,
            category: null,
            detected_category: null,
            recommendedDepartment: null,
            recommended_department: null,
            raw: null
        };
    }

    let result = response;
    if (result.data !== undefined && typeof result.data === "object" && result.data !== null) {
        result = result.data;
    }
    if (result.data !== undefined && typeof result.data === "object" && result.data !== null && result.valid === undefined) {
        result = result.data;
    }

    const isValid = result.valid === true;
    const detectedClass = result.detected_class ?? result.detectedClass ?? null;
    const detectedConf = result.detected_confidence ?? result.detectedConfidence ?? (result.confidence ? Math.round(result.confidence * 1000) / 10 : null);
    const cat = result.category ?? result.detected_category ?? result.detectedCategory ?? null;
    const dept = result.recommended_department ?? result.recommendedDepartment ?? null;
    const errType = result.error_type ?? result.errorType ?? (isValid ? null : "VALIDATION_FAILED");
    const stg = result.stage ?? (isValid ? "CIVIC_VERIFICATION" : "SAFETY_FILTER");
    const stat = result.status ?? (isValid ? "VALID_CIVIC_ISSUE" : "REJECTED");
    const msg = result.message ?? (isValid ? `Verified Civic Evidence: ${detectedClass}` : "Image failed intake validation.");

    return {
        success: result.success ?? isValid,
        valid: isValid,
        stage: stg,
        status: stat,
        errorType: errType,
        error_type: errType,
        message: msg,
        detectedClass: detectedClass,
        detected_class: detectedClass,
        detectedConfidence: detectedConf,
        detected_confidence: detectedConf,
        category: cat,
        detected_category: cat,
        recommendedDepartment: dept,
        recommended_department: dept,
        raw: result
    };
}

export const aiService = {
    classify: async (title, description) => {
        const res = await API.post("/ai/classify", { title, description });
        return unwrap(res);
    },
    predictPriorityScore: async (severity, affectedPeople, category, description) => {
        const res = await API.post("/ai/priority-score", { severity, affectedPeople, category, description });
        return unwrap(res);
    },
    findDuplicates: async (complaintId) => {
        const res = await API.get(`/ai/duplicates/${complaintId}`);
        return unwrap(res);
    },
    recommendUniversities: async (complaintId) => {
        const res = await API.get(`/ai/university-recommendations/${complaintId}`);
        return unwrap(res);
    },
    validateImage: async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await API.post("/ai/validate-image", formData);
        return normalizeAiValidationResponse(res);
    },
    generateComplaintDetails: async (file, location, description, variation = 0) => {
        const formData = new FormData();
        formData.append("file", file);
        if (location) formData.append("location", location);
        if (description) formData.append("description", description);
        formData.append("variation", variation.toString());
        const res = await API.post("/ai/generate-complaint-details", formData);
        return unwrap(res);
    },
    getHealth: async () => {
        const res = await API.get("/ai/health");
        return unwrap(res);
    },
    getSolutionBlueprint: async (category) => {
        const res = await API.get(`/ai/solution-blueprint?category=${encodeURIComponent(category)}`);
        return unwrap(res);
    }
};

export default aiService;