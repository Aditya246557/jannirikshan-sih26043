import API from "./api";

export const teamService = {
    createTeam: async (data) => {
        const res = await API.post("/teams", data);
        return res.data;
    },
    getForProject: async (projectId) => {
        const res = await API.get(`/teams/project/${projectId}`);
        return res.data;
    },
    getMembers: async (teamId) => {
        const res = await API.get(`/teams/${teamId}/members`);
        return res.data;
    },
    addMember: async (teamId, studentId, roleInTeam) => {
        const res = await API.post(`/teams/${teamId}/members`, { studentId, roleInTeam });
        return res.data;
    }
};
export default teamService;