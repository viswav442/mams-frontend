import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getPurchases = (params, token) =>
  axios.get(`${API_URL}/purchases`, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });

const createPurchase = (data, token) =>
  axios.post(`${API_URL}/purchases`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

const getAssets = (token, asset_type_id) =>
  axios.get(`${API_URL}/reference/assets`, {
    params: asset_type_id ? { asset_type_id } : {},
    headers: { Authorization: `Bearer ${token}` },
  });

const getAssetTypes = (token) =>
  axios.get(`${API_URL}/reference/asset-types`, {
    headers: { Authorization: `Bearer ${token}` },
  });

const getBases = () => axios.get(`${API_URL}/reference/bases`);

const purchasesService = {
  getPurchases,
  createPurchase,
  getAssets,
  getAssetTypes,
  getBases,
};

export default purchasesService;
