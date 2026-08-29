import API from "./api";

export const impactService = {
    getSummary: async () => {
        const res = await API.get("/impact/summary");
        return res.data;
    },
    getForChallenge: async (challengeId) => {
        const res = await API.get(`/impact/challenge/${challengeId}`);
        return res.data;
    },
    recordImpact: async (data) => {
        const res = await API.post("/impact", data);
        return res.data;
    }
};
export default impactService;