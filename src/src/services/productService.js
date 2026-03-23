import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export const getProducts = () => axios.get(`${API_URL}/products`);
export const addProduct = (data) => axios.post(`${API_URL}/products`, data);
export const updateProduct = (id, data) => axios.put(`${API_URL}/products/${id}`, data);
export const deleteProduct = (id) => axios.delete(`${API_URL}/products/${id}`);
export const getCategories = () => axios.get(`${API_URL}/categories`);