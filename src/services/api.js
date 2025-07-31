import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const productsApi = {
  getProducts: async (filters) => {
    const response = await axios.get(`${API_URL}/products`, { params: filters });
    return response.data;
  },

  getCategories: async () => {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data;
  },

  createProduct: async (product) => {
    const response = await axios.post(`${API_URL}/products`, product);
    return response.data;
  },

  updateProduct: async (id, product) => {
    const response = await axios.put(`${API_URL}/products/${id}`, product);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await axios.delete(`${API_URL}/products/${id}`);
    return response.data;
  },

  bulkUploadProducts: async (products) => {
    try {
      const response = await axios.post(`${API_URL}/products/bulk-upload`, { products });
      return response.data;
    } catch (error) {
      console.error('Bulk upload error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Failed to upload products');
    }
  }
};

export { productsApi };