import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    // Do not leave the submit screen loading forever when a local service is down.
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
    }

    return config;
});

export default api;
