import API from "./api";

export const analyticsService = {
    get: async () => {
        const res = await API.get("/analytics/overview");
        return res.data?.data || res.data;
    },
    getOverview: async () => {
        const res = await API.get("/analytics/overview");
        return res.data?.data || res.data;
    },
    getDistrict: async (district) => {
        const res = await API.get(`/analytics/district/${district}`);
        return res.data?.data || res.data;
    }
};
export default analyticsService;