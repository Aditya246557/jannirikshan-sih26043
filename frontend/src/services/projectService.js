import API from "./api";

const unwrap = (res) => (res.data?.data !== undefined ? res.data.data : res.data);

export const projectService = {
    create: async (data) => {
        const res = await API.post("/projects", data);
        return unwrap(res);
    },
    get: async (id) => {
        const res = await API.get(`/projects/${id}`);
        return unwrap(res);
    },
    getByChallenge: async (challengeId) => {
        const res = await API.get(`/projects/challenge/${challengeId}`);
        return unwrap(res);
    },
    getByUniversity: async (universityId) => {
        const res = await API.get(`/projects/university/${universityId}`);
        return unwrap(res);
    },
    getByMentor: async (mentorId) => {
        const res = await API.get(`/projects/mentor/${mentorId}`);
        return unwrap(res);
    },
    getMyProjects: async () => {
        const res = await API.get("/projects/my-projects");
        return unwrap(res);
    },
    getAll: async (page = 0, size = 50) => {
        const res = await API.get(`/projects?page=${page}&size=${size}`);
        return unwrap(res);
    },
    updateStage: async (id, stage, progress, notes) => {
        const res = await API.patch(`/projects/${id}/stage`, { stage, progress, notes });
        return unwrap(res);
    }
};
export default projectService;