import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080", 
  headers: {
    "Content-Type": "application/json"
  }
});
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
export default API;