// src/utils/auth.js

export const setToken = (token) => {
  localStorage.setItem("bn_token", token);
};

export const getToken = () => {
  return localStorage.getItem("bn_token");
};

export const removeToken = () => {
  localStorage.removeItem("bn_token");
};

// Funkcija, kuri paruošia Headerius užklausoms
export const getAuthHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
};