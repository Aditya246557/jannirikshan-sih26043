import API from "./api";

const unwrap = (res) => (res.data?.data !== undefined ? res.data.data : res.data);

export const milestoneService = {
    getByProject: async (projectId) => {
        const res = await API.get(`/milestones/project/${projectId}`);
        return unwrap(res);
    },
    create: async (projectId, data) => {
        const res = await API.post(`/milestones/project/${projectId}`, data);
        return unwrap(res);
    },
    submit: async (id, deliverables, submissionNotes) => {
        const payload = typeof deliverables === "object" 
            ? { deliverables: JSON.stringify(deliverables), submissionNotes: submissionNotes || "" }
            : { deliverables: String(deliverables || ""), submissionNotes: submissionNotes || "" };
        const res = await API.post(`/milestones/${id}/submit`, payload);
        return unwrap(res);
    },
    submitDeliverables: async (id, deliverables, submissionNotes) => {
        const payload = typeof deliverables === "object" 
            ? { deliverables: JSON.stringify(deliverables), submissionNotes: submissionNotes || "" }
            : { deliverables: String(deliverables || ""), submissionNotes: submissionNotes || "" };
        const res = await API.post(`/milestones/${id}/submit`, payload);
        return unwrap(res);
    },
    review: async (id, approved, feedback) => {
        const isApproved = approved === true || approved === "APPROVED";
        const res = await API.post(`/milestones/${id}/review`, { approved: isApproved, feedback });
        return unwrap(res);
    },
    reviewDeliverables: async (id, statusOrApproved, feedback) => {
        const isApproved = statusOrApproved === true || statusOrApproved === "APPROVED";
        const res = await API.post(`/milestones/${id}/review`, { approved: isApproved, feedback });
        return unwrap(res);
    },
    reviewMilestone: async (id, approved, feedback) => {
        const isApproved = approved === true || approved === "APPROVED";
        const res = await API.post(`/milestones/${id}/review`, { approved: isApproved, feedback });
        return unwrap(res);
    },
    approve: async (id, feedback) => {
        const res = await API.post(`/milestones/${id}/review`, { approved: true, feedback: feedback || "Milestone deliverables verified and accepted by Faculty Mentor." });
        return unwrap(res);
    },
    reject: async (id, feedback) => {
        const res = await API.post(`/milestones/${id}/review`, { approved: false, feedback: feedback || "Changes requested by Faculty Mentor." });
        return unwrap(res);
    }
};
export default milestoneService;