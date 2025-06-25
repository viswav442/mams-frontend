import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
console.log(API_URL);

const register = (userData) => {
  return axios.post(`${API_URL}/auth/register`, userData);
};

const login = (userData) => {
  console.log(userData);
  return axios.post(`${API_URL}/auth/login`, userData);
};

const getBases = () => {
  // We'll need a token for this, but for now, let's assume it's public
  // or handle the token logic later in the component.
  return axios.get(`${API_URL}/reference/bases`);
};

const authService = {
  register,
  login,
  getBases,
};

export default authService;
