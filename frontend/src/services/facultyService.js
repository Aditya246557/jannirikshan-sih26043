import api from "./api";

const facultyService = {
  getMyProfile: async () => {
    const res = await api.get("/faculty/my-profile");
    return res.data?.data || res.data;
  },
  getAll: async () => {
    const res = await api.get("/faculty/all");
    return res.data?.data || res.data || [];
  }
};

export default facultyService;
