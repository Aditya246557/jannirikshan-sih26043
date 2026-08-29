import API from "./api";

export const notificationService = {
    getMyNotifications: async (page = 0, size = 15) => {
        const res = await API.get(`/notifications?page=${page}&size=${size}`);
        return res.data;
    },
    getMine: async (page = 0, size = 15) => {
        const res = await API.get(`/notifications?page=${page}&size=${size}`);
        return res.data;
    },
    getUnreadCount: async () => {
        const res = await API.get("/notifications/unread-count");
        return res.data;
    },
    markRead: async (id) => {
        const res = await API.patch(`/notifications/${id}/read`);
        return res.data;
    },
    markAllRead: async () => {
        const res = await API.post("/notifications/read-all");
        return res.data;
    }
};
export default notificationService;