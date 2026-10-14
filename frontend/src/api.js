import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export async function getShelters() {
  const res = await axios.get(`${API_BASE}/shelters`);
  return res.data;
}