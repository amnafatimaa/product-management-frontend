import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './ProductsWrapper.module.css';
import Header from '../../components/Header/Header';
import Filters from '../../components/Filters/Filters';
import DataTable from '../../components/DataTable/DataTable';
import CreateProductForm from '../../components/CreateProductForm/CreateProductForm';
import EditProductForm from '../../components/EditProductForm/EditProductForm';
import LoadingContainer from '../../components/LoadingContainer/LoadingContainer';
import ErrorContainer from '../../components/ErrorContainer/ErrorContainer';
import ExcelUpload from '../../components/ExcelUpload/ExcelUpload';
import useProducts from '../../hooks/useProducts';
import { productsApi } from '../../services/api';

const ProductsWrapper = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
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
    refreshData,
  } = useProducts();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showExcelUpload, setShowExcelUpload] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // Sync filters with URL on mount and when searchParams change
  useEffect(() => {
    const urlFilters = {
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      min_price: searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')) : '',
      max_price: searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')) : '',
      sort_by: searchParams.get('sort_by') || 'id',
      order: searchParams.get('order') || 'asc',
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')) : 10,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')) : 1,
    };
    // Only update if URL filters differ from current filters
    if (
      urlFilters.search !== filters.search ||
      urlFilters.category !== filters.category ||
      urlFilters.min_price !== filters.min_price ||
      urlFilters.max_price !== filters.max_price ||
      urlFilters.sort_by !== filters.sort_by ||
      urlFilters.order !== filters.order ||
      urlFilters.limit !== pagination.limit ||
      urlFilters.page !== pagination.page
    ) {
      handleFilterChange({
        search: urlFilters.search,
        category: urlFilters.category,
        min_price: urlFilters.min_price,
        max_price: urlFilters.max_price,
      });
      handleSort(urlFilters.sort_by, urlFilters.order);
      handleLimitChange(urlFilters.limit);
      handlePageChange(urlFilters.page);
    }
  }, [searchParams, filters, pagination, handleFilterChange, handleSort, handleLimitChange, handlePageChange]);

  // Update URL when filters change
  useEffect(() => {
    const newParams = {};
    if (filters.search) newParams.search = filters.search;
    if (filters.category) newParams.category = filters.category;
    if (filters.min_price) newParams.min_price = filters.min_price;
    if (filters.max_price) newParams.max_price = filters.max_price;
    if (filters.sort_by && filters.sort_by !== 'id') newParams.sort_by = filters.sort_by;
    if (filters.order && filters.order !== 'asc') newParams.order = filters.order;
    if (pagination.limit !== 10) newParams.limit = pagination.limit;
    if (pagination.page !== 1) newParams.page = pagination.page;
    setSearchParams(newParams, { replace: true });
  }, [filters, pagination, setSearchParams]);

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'price', label: 'Price', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'description', label: 'Description', sortable: false },
    { key: 'created_at', label: 'Created', sortable: true },
  ];

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowEditForm(true);
  };

  const handleDelete = async (productId) => {
    try {
      setDeleteError(null);
      await productsApi.deleteProduct(productId);
      refreshData();
    } catch (err) {
      console.error('Failed to delete product:', err);
      setDeleteError('Failed to delete product. Please try again.');
    }
  };

  const handleCreateSuccess = () => {
    refreshData();
    setShowCreateForm(false);
  };

  const handleEditSuccess = () => {
    refreshData();
    setShowEditForm(false);
    setEditingProduct(null);
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
        title='Products'
        onCreateClick={() => setShowCreateForm(true)}
        onExcelUploadClick={() => setShowExcelUpload(true)}
      />
      {error && <ErrorContainer error={error} />}
      {deleteError && <ErrorContainer error={deleteError} />}
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
      <ExcelUpload
        isOpen={showExcelUpload}
        onClose={() => setShowExcelUpload(false)}
        onSuccess={refreshData}
      />
    </div>
  );
};

export default ProductsWrapper;