import API from "./api";

const unwrap = (res) => (res.data?.data !== undefined ? res.data.data : res.data);

export const universityService = {
    getAll: async () => {
        const res = await API.get("/university/all");
        return unwrap(res);
    },
    getMyProfile: async () => {
        const res = await API.get("/university/my-profile");
        return unwrap(res);
    },
    getAssignedChallenges: async (universityId) => {
        const res = await API.get(`/university/${universityId}/assigned-challenges`);
        return unwrap(res);
    },
    acceptChallenge: async (challengeId, facultyId) => {
        const res = await API.post(`/university/challenges/${challengeId}/accept`, { facultyId });
        return unwrap(res);
    },
    rejectChallenge: async (challengeId, reason) => {
        const res = await API.post(`/university/challenges/${challengeId}/reject`, { reason });
        return unwrap(res);
    },
    getFaculty: async (universityId) => {
        const res = await API.get(`/university/${universityId}/faculty`);
        return unwrap(res);
    },
    getStudents: async (universityId) => {
        const res = await API.get(`/university/${universityId}/students`);
        return unwrap(res);
    },
    getDepartments: async (universityId) => {
        const res = await API.get(`/university/${universityId}/departments`);
        return unwrap(res);
    }
};
export default universityService;
