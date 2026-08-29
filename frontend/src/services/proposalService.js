import api from "./api";

const proposalService = {
  create: async (data) => {
    const res = await api.post("/proposals", data);
    return res.data?.data || res.data;
  },
  getAll: async () => {
    const res = await api.get("/proposals");
    return res.data?.data || res.data || [];
  },
  getById: async (id) => {
    const res = await api.get(`/proposals/${id}`);
    return res.data?.data || res.data;
  },
  getByComplaint: async (complaintId) => {
    const res = await api.get(`/proposals/complaint/${complaintId}`);
    return res.data?.data || res.data || [];
  },
  getByUniversity: async (universityId) => {
    const res = await api.get(`/proposals/university/${universityId}`);
    return res.data?.data || res.data || [];
  },
  updateStatus: async (id, status, remarks) => {
    const res = await api.patch(`/proposals/${id}/status`, { status, remarks });
    return res.data?.data || res.data;
  }
};

export default proposalService;
