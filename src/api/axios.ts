import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://4unq8dl7a7.execute-api.ap-south-1.amazonaws.com/prod/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
