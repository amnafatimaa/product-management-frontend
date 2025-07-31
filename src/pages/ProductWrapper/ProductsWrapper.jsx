import React, { useState } from 'react';
import styles from './ProductsWrapper.module.css';
import Header from '../../components/Header/Header';
import Filters from '../../components/Filters/Filters';
import DataTable from '../../components/DataTable/DataTable';
import CreateProductForm from '../../components/CreateProductForm/CreateProductForm';
import EditProductForm from '../../components/EditProductForm/EditProductForm';
import LoadingContainer from '../../components/LoadingContainer/LoadingContainer';
import ErrorContainer from '../../components/ErrorContainer/ErrorContainer';
import useProducts from '../../hooks/useProducts';

const ProductsWrapper = () => {
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
    refreshData
  } = useProducts();

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

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowEditForm(true);
  };

  const handleDelete = async (productId) => {
    try {
      await productsApi.deleteProduct(productId);
      refreshData();
    } catch (error) {
      console.error('Failed to delete product:', error);
      error('Failed to delete product. Please try again.');
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
      <Header title="Products" onCreateClick={() => setShowCreateForm(true)} />
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