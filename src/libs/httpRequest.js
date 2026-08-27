const baseUrl = import.meta.env.VITE_API_BASE_URL;

const buildHeaders = (auth) => {
    const headers = { "Content-Type": "application/json" };
    if (auth) {
        const token = localStorage.getItem("access_token");
        if (token) headers.Authorization = `Bearer ${token}`;
    }
    return headers;
};

export const httpRequest = {
    get: async (url, auth = false) => {
        try {
            const res = await fetch(`${baseUrl}${url}`, { headers: buildHeaders(auth) });
            if (!res.ok) throw new Error("Failed to fetch data");
            return await res.json();
        } catch (error) {
            console.log(error);
        }
    },

    // post/put/del throw lỗi để form login/signup bắt và hiển thị message
    post: async (url, body, auth = false) => {
        const res = await fetch(`${baseUrl}${url}`, {
            method: "POST",
            headers: buildHeaders(auth),
            body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || data.error || "Đã có lỗi xảy ra");
        return data;
    },

    put: async (url, body, auth = false) => {
        const res = await fetch(`${baseUrl}${url}`, {
            method: "PUT",
            headers: buildHeaders(auth),
            body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || data.error || "Đã có lỗi xảy ra");
        return data;
    },

    del: async (url, auth = false) => {
        const res = await fetch(`${baseUrl}${url}`, {
            method: "DELETE",
            headers: buildHeaders(auth),
        });
        if (!res.ok) throw new Error("Đã có lỗi xảy ra");
        return true;
    },
};