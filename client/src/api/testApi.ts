import api from "./axios";

export const testApi = async () => {
    const response = await api.get("/");
    return response.data;
};