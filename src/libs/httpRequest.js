const baseUrl = import.meta.env.VITE_API_BASE_URL;

export const httpRequest = {
    get: async (url) => {
        try {
            const res = await fetch(`${baseUrl}${url}`);
            if (!res.ok) throw new Error("Failed to fetch data");
            const data = await res.json();
            return data;
        } catch (error) {
            console.log(error);
        }
    },
};

