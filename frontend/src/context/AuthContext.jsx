import React, { createContext, useState, useEffect, useContext } from "react";
import authService from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("sih_user");
        const token = localStorage.getItem("sih_token");
        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem("sih_user");
                localStorage.removeItem("sih_token");
            }
        }
        setLoading(false);
    }, []);

    const login = async (credentialsOrEmail, maybePassword) => {
        if (credentialsOrEmail?.token && credentialsOrEmail?.role) {
            localStorage.setItem("sih_token", credentialsOrEmail.token);
            localStorage.setItem("sih_user", JSON.stringify(credentialsOrEmail));
            setUser(credentialsOrEmail);
            return credentialsOrEmail;
        }
        const data = await authService.login(credentialsOrEmail, maybePassword);
        setUser(data);
        return data;
    };

    const register = async (userData) => {
        const data = await authService.register(userData);
        setUser(data);
        return data;
    };

    const switchDemoUser = async (demoUser) => {
        return await login({ email: demoUser.email, password: demoUser.password });
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, switchDemoUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}