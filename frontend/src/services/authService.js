import API from "./api";

export const authService = {
    login: async (credentialsOrEmail, maybePassword) => {
        const payload =
            typeof credentialsOrEmail === "object" && credentialsOrEmail !== null
                ? credentialsOrEmail
                : { email: credentialsOrEmail, password: maybePassword };
        const res = await API.post("/auth/login", payload);
        const authData = res?.data || res;
        if (authData?.token) {
            localStorage.setItem("sih_token", authData.token);
            localStorage.setItem("sih_user", JSON.stringify(authData));
        }
        return authData;
    },
    register: async (userData) => {
        const res = await API.post("/auth/register", userData);
        if (res.data?.token) {
            localStorage.setItem("sih_token", res.data.token);
            localStorage.setItem("sih_user", JSON.stringify(res.data));
        }
        return res.data;
    },
    getCurrentUser: async () => {
        const res = await API.get("/auth/me");
        return res.data;
    },
    changePassword: async (data) => {
        return await API.post("/auth/change-password", data);
    },
    getDemoUsers: async () => {
        const res = await API.get("/auth/demo-users");
        return res.data;
    },
    logout: () => {
        localStorage.removeItem("sih_token");
        localStorage.removeItem("sih_user");
    }
};
export default authService;