import axios from 'axios';

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

export async function getShelters() {
  const res = await axios.get(`${API_BASE}/shelters`);
  return res.data;
}