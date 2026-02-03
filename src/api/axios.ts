import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    // "https://fa63e5jdykw6yezyftus4n6scy0gacnm.lambda-url.ap-south-1.on.aws/api/v1",
    "http://localhost:6060/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
