import API from "./api";

export const evidenceService = {
    upload: async (complaintId, files, onProgress, metadata = {}) => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append("files", file);
        });
        if (metadata.evidenceType) formData.append("evidenceType", metadata.evidenceType);
        if (metadata.description) formData.append("description", metadata.description);
        if (metadata.latitude) formData.append("latitude", metadata.latitude);
        if (metadata.longitude) formData.append("longitude", metadata.longitude);

        const res = await API.post(`/evidence/upload/${complaintId}`, formData, {
            headers: {
                "Content-Type": undefined
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percent);
                }
            },
        });
        return res?.data || res;
    },
    getForComplaint: async (complaintId) => {
        const res = await API.get(`/evidence/complaint/${complaintId}`);
        return res.data?.data || res.data;
    },
    getForProject: async (projectId) => {
        const res = await API.get(`/evidence/project/${projectId}`);
        return res.data?.data || res.data;
    },
    verifyEvidence: async (id, status, note) => {
        const res = await API.post(`/evidence/${id}/verify`, { status, note });
        return res.data;
    },
    delete: async (id) => {
        const res = await API.delete(`/evidence/${id}`);
        return res.data;
    }
};
export default evidenceService;