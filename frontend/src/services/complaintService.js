import API from "./api";

export const complaintService = {
    create: async (data) => {
        const res = await API.post("/complaints", data);
        return res.data;
    },
    get: async (id) => {
        const res = await API.get(`/complaints/${id}`);
        return res.data;
    },
    getById: async (id) => {
        const res = await API.get(`/complaints/${id}`);
        return res.data;
    },
    getMine: async (page = 0, size = 10) => {
        const res = await API.get(`/complaints/mine?page=${page}&size=${size}`);
        return res.data;
    },
    explore: async (params = {}) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== "") query.append(key, val);
        });
        const res = await API.get(`/complaints/explore?${query.toString()}`);
        return res.data;
    },
    search: async (params = {}) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== "") query.append(key, val);
        });
        const res = await API.get(`/complaints/explore?${query.toString()}`);
        return res.data;
    },
    getPublic: async () => {
        const res = await API.get("/complaints/public");
        return res.data;
    },
    review: async (id, approved, remarks) => {
        const res = await API.post(`/complaints/${id}/review`, { approved, remarks });
        return res.data;
    },
    requestClarification: async (id, message) => {
        const res = await API.post(`/complaints/${id}/clarification/request`, { message });
        return res.data;
    },
    respondClarification: async (id, message) => {
        const res = await API.post(`/complaints/${id}/clarification/respond`, { message });
        return res.data;
    },
    changePriority: async (id, priority, score) => {
        const res = await API.patch(`/complaints/${id}/priority`, { priority, score });
        return res.data;
    },
    changeCategory: async (id, category) => {
        const res = await API.patch(`/complaints/${id}/category`, { category });
        return res.data;
    },
    assignUniversity: async (id, universityId, departmentId, facultyId) => {
        const res = await API.post(`/complaints/${id}/assign-university`, { universityId, departmentId, facultyId });
        return res.data;
    },
    mergeDuplicate: async (masterId, duplicateId) => {
        const res = await API.post("/complaints/merge-duplicate", { masterId, duplicateId });
        return res.data;
    },
    update: async (id, data) => {
        const res = await API.put(`/complaints/${id}`, data);
        return res.data;
    },
    cancel: async (id) => {
        const res = await API.delete(`/complaints/${id}`);
        return res.data;
    }
};
export default complaintService;