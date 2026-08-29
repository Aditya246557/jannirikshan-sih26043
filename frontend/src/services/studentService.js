import api from "./api";

const studentService = {
  getMyProfile: async () => {
    const res = await api.get("/students/my-profile");
    return res.data?.data || res.data;
  },
  updateProfile: async (data) => {
    const res = await api.put("/students/my-profile", data);
    return res.data?.data || res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/students/${id}`);
    return res.data?.data || res.data;
  },
  getAll: async () => {
    const res = await api.get("/students/all");
    return res.data?.data || res.data || [];
  }
};

export default studentService;
