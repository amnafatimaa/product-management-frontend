import React, { useState, useEffect } from 'react';
import styles from './EditProductForm.module.css';
import { productsApi } from '../../services/api';

// Reusable Form Field Components
const TextInput = ({ label, name, value, onChange, error, placeholder, type = 'text', ...props }) => (
  <div className={styles.formGroup}>
    <label htmlFor={name} className={styles.label}>{label}</label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className={`${styles.input} ${error ? styles.error : ''}`}
      placeholder={placeholder}
      {...props}
    />
    {error && <span className={styles.errorMessage}>{error}</span>}
  </div>
);

const SelectInput = ({ label, name, value, onChange, error, options }) => (
  <div className={styles.formGroup}>
    <label htmlFor={name} className={styles.label}>{label}</label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className={styles.select}
    >
      <option value="">Select a category</option>
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
    {error && <span className={styles.errorMessage}>{error}</span>}
  </div>
);

const TextAreaInput = ({ label, name, value, onChange, placeholder }) => (
  <div className={styles.formGroup}>
    <label htmlFor={name} className={styles.label}>{label}</label>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className={styles.textArea}
      placeholder={placeholder}
    />
  </div>
);

// Modal Component
const ModalComponent = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className={styles.modal} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Main Form Component
const EditProductForm = ({ isOpen, onClose, onSuccess, product }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: ''
  });
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const DEFAULT_CATEGORIES = [
    'Electronics',
    'Clothing',
    'Books',
    'Home & Garden',
    'Sports',
    'Other'
  ];

  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        name: product.name || '',
        price: product.price?.toString() || '',
        category: product.category || '',
        description: product.description || ''
      });
      setErrors({});
      loadCategories();
    }
  }, [isOpen, product]);

  const loadCategories = async () => {
    try {
      const data = await productsApi.getCategories();
      setCategories(Array.from(new Set([...(data || []), ...DEFAULT_CATEGORIES])));
    } catch (error) {
      setCategories(DEFAULT_CATEGORIES);
      console.error('Failed to load categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Price must be a positive number';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price)
      };
      await productsApi.updateProduct(product.id, productData);
      setFormData({
        name: '',
        price: '',
        category: '',
        description: ''
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update product:', error);
      if (error.response?.data?.detail) {
        setErrors({ submit: error.response.data.detail });
      } else {
        setErrors({ submit: 'Failed to update product. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <ModalComponent isOpen={isOpen} onClose={onClose} title="Edit Product">
      <form className={styles.form} onSubmit={handleSubmit}>
        <TextInput
          label="Product Name *"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Enter product name"
        />
        <TextInput
          label="Price *"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          error={errors.price}
          placeholder="0.00"
          step="0.01"
          min="0"
        />
        <SelectInput
          label="Category *"
          name="category"
          value={formData.category}
          onChange={handleChange}
          error={errors.category}
          options={categories}
        />
        <TextAreaInput
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter product description (optional)"
        />
        {errors.submit && <span className={styles.errorMessage}>{errors.submit}</span>}
        <div className={styles.buttonGroup}>
          <button type="button" className={`${styles.button} ${styles.secondary}`} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={`${styles.button} ${styles.primary}`} disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Product'}
          </button>
        </div>
      </form>
    </ModalComponent>
  );
};

export default EditProductForm;