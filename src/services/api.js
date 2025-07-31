import axios from 'axios';

// Updated API base URL - make sure this matches your backend server
const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    
    // More specific error messages
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      console.error('❌ Cannot connect to backend server. Make sure FastAPI is running on http://localhost:8000');
    }
    
    return Promise.reject(error);
  }
);

// Products API
export const productsApi = {
  // Delete product
  deleteProduct: async (id) => {
    try {
      console.log(`🗑️ Attempting to delete product with ID: ${id}`);
      const response = await api.delete(`/products/${id}`);
      console.log('✅ Product deleted successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to delete product:', error);
      throw error;
    }
  },

  // Create product
  createProduct: async (productData) => {
    try {
      console.log('📝 Creating product:', productData);
      const response = await api.post('/products', productData);
      console.log('✅ Product created successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create product:', error);
      throw error;
    }
  },

  // Get all products
  getProducts: async (params = {}) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch products:', error);
      throw error;
    }
  },

  // Get single product
  getProduct: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch product:', error);
      throw error;
    }
  },

  // Update product
  updateProduct: async (id, productData) => {
    try {
      console.log(`📝 Updating product ${id}:`, productData);
      const response = await api.put(`/products/${id}`, productData);
      console.log('✅ Product updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update product:', error);
      throw error;
    }
  },

  // Get categories
  getCategories: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch categories:', error);
      return [];
    }
  },
};

export default api;