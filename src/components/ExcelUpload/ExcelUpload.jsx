import React, { useState, useRef, useCallback, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { productsApi } from '../../services/api';
import styles from './ExcelUpload.module.css';

const ExcelUtils = {
  readFile: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(new Error('Failed to read file: ' + error.message));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  },

  normalizeProduct: (product) => {
    const normalized = {};
    Object.keys(product).forEach(key => {
      const normalizedKey = key.toLowerCase().trim();
      if (normalizedKey.includes('name')) normalized.name = product[key];
      else if (normalizedKey.includes('price')) normalized.price = product[key];
      else if (normalizedKey.includes('category')) normalized.category = product[key];
      else if (normalizedKey.includes('description')) normalized.description = product[key];
    });
    return normalized;
  },

  validateProduct: (product, rowNumber) => {
    const errors = [];
    if (!product.name || product.name.toString().trim() === '') {
      errors.push('Name is required');
    }
    if (!product.price || isNaN(parseFloat(product.price)) || parseFloat(product.price) <= 0) {
      errors.push('Valid price is required');
    }
    if (!product.category || product.category.toString().trim() === '') {
      errors.push('Category is required');
    }
    return errors.length > 0 ? `Row ${rowNumber}: ${errors.join(', ')}` : null;
  },

  formatProduct: (product) => ({
    name: product.name.toString().trim(),
    price: parseFloat(product.price),
    category: product.category.toString().trim(),
    description: product.description ? product.description.toString().trim() : ''
  })
};

const ExcelUpload = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStats, setUploadStats] = useState(null);
  const fileInputRef = useRef(null);

  const resetState = useCallback(() => {
    setPreviewData([]);
    setErrors([]);
    setUploadStats(null);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    console.log('State reset');
  }, []);

  const handleFileChange = useCallback(async (event) => {
    const selectedFile = event.target.files[0];
    console.log('File selected:', selectedFile ? selectedFile.name : 'No file');
    setFile(selectedFile);

    if (selectedFile) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      if (!validTypes.includes(selectedFile.type)) {
        setErrors(['Please select a valid Excel (.xlsx, .xls) or CSV (.csv) file']);
        console.log('Invalid file type:', selectedFile.type);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      try {
        const data = await ExcelUtils.readFile(selectedFile);
        console.log('Parsed data:', data);
        setPreviewData(data.slice(0, 3));
      } catch (error) {
        setErrors([error.message]);
        console.error('File parsing error:', error.message);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } else {
      resetState();
    }
  }, [resetState]);

  const handleUpload = useCallback(async () => {
    console.log('Upload button clicked, file:', file ? file.name : 'No file');
    if (!file) {
      setErrors(['Please select a file first']);
      console.log('No file selected for upload');
      return;
    }
    setIsProcessing(true);
    setErrors([]);

    try {
      const rawData = await ExcelUtils.readFile(file);
      console.log('Raw data length:', rawData.length);
      const validProducts = [];
      const errorMessages = [];

      rawData.forEach((product, index) => {
        const rowNumber = index + 2;
        const normalized = ExcelUtils.normalizeProduct(product);
        const validationError = ExcelUtils.validateProduct(normalized, rowNumber);
        if (validationError) {
          errorMessages.push(validationError);
        } else {
          validProducts.push(ExcelUtils.formatProduct(normalized));
        }
      });

      console.log('Valid products:', validProducts.length, 'Errors:', errorMessages);

      if (errorMessages.length > 0) {
        setErrors(errorMessages);
      }

      if (validProducts.length === 0) {
        setErrors(prev => [...prev, 'No valid products found to import']);
        setIsProcessing(false);
        return;
      }

      const response = await productsApi.bulkUploadProducts(validProducts);
      console.log('API response:', response);
      const stats = {
        total: validProducts.length,
        success: response.count,
        failed: validProducts.length - response.count
      };
      setUploadStats(stats);

      if (stats.success > 0 && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setErrors([error.message || 'Failed to upload products. Please try again.']);
      console.error('Upload error:', error.message);
    } finally {
      setIsProcessing(false);
    }
  }, [file, onSuccess]);

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen, resetState]);

  if (!isOpen) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Import Products from Excel/CSV</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.content}>
          <div className={styles.instructions}>
            <h3>Instructions:</h3>
            <ol>
              <li>Prepare an Excel (.xlsx, .xls) or CSV (.csv) file.</li>
              <li>Ensure columns: Product Name, Price, Category, Description (optional).</li>
              <li>Upload the file below.</li>
            </ol>
          </div>
          <div className={styles.uploadSection}>
            <div className={styles.fileInputContainer}>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                ref={fileInputRef}
                className={styles.fileInput}
                id="excel-upload"
              />
              <label htmlFor="excel-upload" className={styles.fileInputLabel}>
                {file ? `📁 ${file.name}` : '📁 Choose Excel/CSV File'}
              </label>
            </div>
          </div>
          {previewData.length > 0 && (
            <div className={styles.preview}>
              <h4>Preview (First 3 rows):</h4>
              <div className={styles.previewTable}>
                <table>
                  <thead>
                    <tr>
                      {Object.keys(previewData[0]).map(key => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, i) => (
                          <td key={i}>{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {errors.length > 0 && (
            <div className={styles.errorContainer}>
              <h4>Errors:</h4>
              <ul>
                {errors.map((error, index) => (
                  <li key={index} className={styles.errorMessage}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          {uploadStats && (
            <div className={styles.statsContainer}>
              <h4>Upload Results:</h4>
              <p>✅ Successfully imported: {uploadStats.success} products</p>
              {uploadStats.failed > 0 && (
                <p>❌ Failed to import: {uploadStats.failed} products</p>
              )}
              <p>📊 Total processed: {uploadStats.total} products</p>
            </div>
          )}
        </div>
        <div className={styles.buttonGroup}>
          <button
            className={`${styles.button} ${styles.secondary}`}
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            className={`${styles.button} ${styles.primary}`}
            onClick={handleUpload}
            disabled={!file || isProcessing}
            style={{ cursor: file && !isProcessing ? 'pointer' : 'not-allowed' }}
          >
            {isProcessing ? 'Processing...' : 'Import Products'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcelUpload;