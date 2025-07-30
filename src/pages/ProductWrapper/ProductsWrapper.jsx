import React, { useState, useEffect, useCallback } from 'react';
import styles from './ProductsWrapper.module.css';
import DataTable from '../../components/DataTable/DataTable';
import CreateProductForm from '../../components/CreateProductForm/CreateProductForm';
import EditProductForm from '../../components/EditProductForm/EditProductForm';
import { productsApi } from '../../services/api';

// Reusable Components
const Header = ({ title, onCreateClick }) => (
  <div className={styles.header}>
    <h1 className={styles.title}>{title}</h1>
    <button className={styles.createButton} onClick={onCreateClick}>
      + Create Product
    </button>
  </div>
);

const FilterGroup = ({ label, children }) => (
  <div className={styles.filterGroup}>
    <label className={styles.filterLabel}>{label}</label>
    {children}
  </div>
);

const Filters = ({ filters, categories, onFilterChange, onLimitChange, pagination }) => (
  <div className={styles.filtersContainer}>
    <div className={styles.filtersRow}>
      <FilterGroup label="Search">
        <input
          type="text"
          className={styles.filterInput}
          placeholder="Search products..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
        />
      </FilterGroup>

      <FilterGroup label="Category">
        <select
          className={styles.filterSelect}
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup label="Price Range">
        <div className={styles.priceRangeContainer}>
          <input
            type="number"
            className={`${styles.filterInput} ${styles.priceInput}`}
            placeholder="Min"
            value={filters.min_price}
            onChange={(e) => onFilterChange('min_price', e.target.value)}
            min="0"
            step="0.01"
          />
          <span>-</span>
          <input
            type="number"
            className={`${styles.filterInput} ${styles.priceInput}`}
            placeholder="Max"
            value={filters.max_price}
            onChange={(e) => onFilterChange('max_price', e.target.value)}
            min="0"
            step="0.01"
          />
        </div>
      </FilterGroup>

      <FilterGroup label="Items per page">
        <select
          className={styles.filterSelect}
          value={pagination.limit}
          onChange={(e) => onLimitChange(parseInt(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </FilterGroup>
    </div>
  </div>
);

const LoadingContainer = () => (
  <div className={styles.loadingContainer}>
    <div>Loading products...</div>
  </div>
);

const ErrorContainer = ({ error }) => (
  <div className={styles.errorContainer}>
    {error}
  </div>
);

const ProductsWrapper = () => {
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'price', label: 'Price', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'description', label: 'Description', sortable: false },
    { key: 'created_at', label: 'Created', sortable: true }
  ];

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      Object.keys(params).forEach(key => {
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
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    if (pagination.page !== 1) {
      setPagination(prev => ({
        ...prev,
        page: 1
      }));
    }
  };

  const handleSort = (sortBy, order) => {
    setFilters(prev => ({
      ...prev,
      sort_by: sortBy,
      order: order
    }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      page: page
    }));
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowEditForm(true);
  };

  const handleDelete = async (productId) => {
    try {
      await productsApi.deleteProduct(productId);
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      setError('Failed to delete product. Please try again.');
    }
  };

  const handleCreateSuccess = () => {
    fetchProducts();
    fetchCategories();
    setShowCreateForm(false);
  };

  const handleEditSuccess = () => {
    fetchProducts();
    fetchCategories();
    setShowEditForm(false);
    setEditingProduct(null);
  };

  const handleLimitChange = (newLimit) => {
    setPagination(prev => ({
      ...prev,
      limit: newLimit,
      page: 1
    }));
  };

  if (loading && products.length === 0) {
    return (
      <div className={styles.container}>
        <LoadingContainer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header
        title="Products"
        onCreateClick={() => setShowCreateForm(true)}
      />
      {error && <ErrorContainer error={error} />}
      <Filters
        filters={filters}
        categories={categories}
        onFilterChange={handleFilterChange}
        onLimitChange={handleLimitChange}
        pagination={pagination}
      />
      <DataTable
        columns={columns}
        data={products}
        pagination={pagination}
        onSort={handleSort}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
        sortBy={filters.sort_by}
        sortOrder={filters.order}
      />
      <CreateProductForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSuccess={handleCreateSuccess}
      />
      <EditProductForm
        isOpen={showEditForm}
        onClose={() => {
          setShowEditForm(false);
          setEditingProduct(null);
        }}
        onSuccess={handleEditSuccess}
        product={editingProduct}
      />
    </div>
  );
};

export default ProductsWrapper;