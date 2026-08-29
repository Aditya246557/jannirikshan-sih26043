import API from "./api";

export const adminService = {
    getStats: async () => {
        const res = await API.get("/admin/dashboard-stats");
        return res.data;
    },
    getUsers: async (role) => {
        const res = await API.get(`/admin/users${role ? `?role=${role}` : ""}`);
        return res.data;
    },
    createUser: async (user) => {
        const res = await API.post("/admin/users", user);
        return res.data;
    },
    setEnabled: async (id, enabled) => {
        const res = await API.patch(`/admin/users/${id}/enabled`, { enabled });
        return res.data;
    },
    getAuditLogs: async (page = 0, size = 20) => {
        const res = await API.get(`/audit?page=${page}&size=${size}`);
        return res.data;
    }
};
export default adminService;