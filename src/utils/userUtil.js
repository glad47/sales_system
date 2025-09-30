import api from '../api/axios'


export const fetchUserType = async () => {
  const token = localStorage.getItem('adminToken');

  if (!token) return null;

  try {
    const res = await api.get(`/service/get_current_user`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.data && res.data.type) {
      return res.data.type;
    }
  } catch (err) {
    console.error('Failed to fetch user type:', err);
  }

  return null;
};



export const fetchUserName= async () => {
  const token = localStorage.getItem('adminToken');

  if (!token) return null;

  try {
    const res = await api.get(`/service/get_current_user`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.data && res.data.username) {
      return res.data.username;
    }
  } catch (err) {
    console.error('Failed to fetch user type:', err);
  }

  return null;
};
