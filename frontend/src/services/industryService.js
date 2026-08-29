import API from "./api";

const unwrap = (res) => (res.data?.data !== undefined ? res.data.data : res.data);

export const industryService = {
    getAll: async () => {
        const res = await API.get("/industry/all");
        return unwrap(res);
    },
    getMyProfile: async () => {
        const res = await API.get("/industry/my-profile");
        return unwrap(res);
    },
    expressInterest: async (data) => {
        const res = await API.post("/industry/partnerships/express-interest", data);
        return unwrap(res);
    },
    approvePartnership: async (id) => {
        const res = await API.post(`/industry/partnerships/${id}/approve`);
        return unwrap(res);
    },
    acceptOffer: async (id) => {
        const res = await API.post(`/industry/partnerships/${id}/accept`);
        return unwrap(res);
    },
    rejectOffer: async (id, reason) => {
        const res = await API.post(`/industry/partnerships/${id}/reject`, { reason });
        return unwrap(res);
    },
    getUniversityPartnerships: async (universityId) => {
        const res = await API.get(`/industry/partnerships/university/${universityId}`);
        return unwrap(res);
    },
    getProjectPartnerships: async (projectId) => {
        const res = await API.get(`/industry/partnerships/project/${projectId}`);
        return unwrap(res);
    },
    getProjectFunding: async (projectId) => {
        const res = await API.get(`/industry/funding/project/${projectId}`);
        return unwrap(res);
    },
    getMyCommitments: async () => {
        const res = await API.get("/industry/my-commitments");
        return unwrap(res);
    }
};
export default industryService;