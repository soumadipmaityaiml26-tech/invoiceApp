import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://4k4kjvugib.execute-api.ap-south-1.amazonaws.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
