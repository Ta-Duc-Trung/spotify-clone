import { httpRequest } from "./httpRequest";

export const auth = {
    async register({ username, email, password, display_name, country }) {
        return httpRequest.post("/api/auth/register", {
            username,
            email,
            password,
            display_name,
            country,
        });
    },
    async login({ email, password }) {
        const data = await httpRequest.post("/api/auth/login", {
            email,
            password,
        });
        if (data?.tokens?.access_token) {
            localStorage.setItem("access_token", data.tokens.access_token);
        }
        if (data?.tokens?.refresh_token) {
            localStorage.setItem("refresh_token", data.tokens.refresh_token);
        }
        if (data?.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
        }
        return data;
    },

    logout() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
    },

    getUser() {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    },

    isAuthenticated() {
        return localStorage.getItem("access_token") ? true : false;
    },
};
