import React, { useState, useEffect } from 'react';
import styles from './CreateProductForm.module.css';
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
const CreateProductForm = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: ''
  });
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      setFormData({
        name: '',
        price: '',
        category: '',
        description: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const loadCategories = async () => {
    const defaultCategories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Other'];
    try {
      const data = await productsApi.getCategories();
      // Merge and deduplicate categories
      setCategories(Array.from(new Set([...defaultCategories, ...(data || [])])));
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories(defaultCategories);
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
      await productsApi.createProduct(productData);
      setFormData({
        name: '',
        price: '',
        category: '',
        description: ''
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create product:', error);
      if (error.response?.data?.detail) {
        setErrors({ submit: error.response.data.detail });
      } else {
        setErrors({ submit: 'Failed to create product. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalComponent isOpen={isOpen} onClose={onClose} title="Create New Product">
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
            {isSubmitting ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </ModalComponent>
  );
};

export default CreateProductForm;