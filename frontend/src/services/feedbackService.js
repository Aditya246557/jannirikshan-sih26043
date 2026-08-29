import API from "./api";

const unwrap = (res) => (res.data?.data !== undefined ? res.data.data : res.data);

export const feedbackService = {
    getForChallenge: async (challengeId) => {
        const res = await API.get(`/comments/challenge/${challengeId}`);
        return unwrap(res);
    },
    getForProject: async (projectId) => {
        const res = await API.get(`/comments/project/${projectId}`);
        return unwrap(res);
    },
    addComment: async (data) => {
        const res = await API.post("/comments", data);
        return unwrap(res);
    },
    submit: async (complaintId, rating, content) => {
        const id = typeof complaintId === "object" ? (complaintId.complaintId || complaintId.challengeId || complaintId.id) : complaintId;
        const rate = typeof complaintId === "object" ? (complaintId.rating || 5) : rating;
        const text = typeof complaintId === "object" ? (complaintId.comments || complaintId.content || "") : content;
        const res = await API.post("/comments", {
            challengeId: id,
            content: `Rating: ${rate}/5 - ${text}`
        });
        return unwrap(res);
    },
    submitFeedback: async (payloadOrId, maybeRating, maybeContent) => {
        let challengeId = null;
        let projectId = null;
        let rating = 5;
        let content = "";

        if (typeof payloadOrId === "object" && payloadOrId !== null) {
            projectId = payloadOrId.projectId || null;
            challengeId = payloadOrId.complaintId || payloadOrId.challengeId || (projectId ? null : payloadOrId.id);
            rating = payloadOrId.rating || 5;
            content = payloadOrId.comments || payloadOrId.content || payloadOrId.feedback || "";
        } else {
            challengeId = payloadOrId;
            rating = maybeRating || 5;
            content = maybeContent || "";
        }

        const body = {
            content: projectId ? content : `Rating: ${rating}/5 - ${content}`
        };
        if (challengeId) body.challengeId = challengeId;
        if (projectId) body.projectId = projectId;

        const res = await API.post("/comments", body);
        return unwrap(res);
    }
};

export default feedbackService;