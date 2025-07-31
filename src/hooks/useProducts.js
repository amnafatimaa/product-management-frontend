import { useState, useEffect, useCallback } from 'react';
import { productsApi } from '../services/api';

const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    min_price: '',
    max_price: '',
    sort_by: 'id',
    order: 'asc'
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page: pagination.page, limit: pagination.limit, ...filters };
      Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });
      const data = await productsApi.getProducts(params);
      setProducts(data.data);
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        total_pages: data.total_pages
      });
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await productsApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
    if (pagination.page !== 1) {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  };

  const handleSort = (sortBy, order) => {
    setFilters((prev) => ({
      ...prev,
      sort_by: sortBy,
      order: order
    }));
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleLimitChange = (newLimit) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const refreshData = () => {
    fetchProducts();
    fetchCategories();
  };

  return {
    products,
    pagination,
    filters,
    categories,
    loading,
    error,
    handleFilterChange,
    handleSort,
    handlePageChange,
    handleLimitChange,
    refreshData
  };
};

export default useProducts;