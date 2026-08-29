import API from "./api";

const unwrap = (res) => (res.data?.data !== undefined ? res.data.data : res.data);

export const taskService = {
    getByProject: async (projectId) => {
        const res = await API.get(`/tasks/project/${projectId}`);
        return unwrap(res);
    },
    create: async (data) => {
        const res = await API.post("/tasks", data);
        return unwrap(res);
    },
    updateStatus: async (id, status) => {
        const res = await API.patch(`/tasks/${id}/status`, { status });
        return unwrap(res);
    }
};
export default taskService;