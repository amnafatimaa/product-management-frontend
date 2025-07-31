import React, { useState, useCallback } from 'react';

const ExcelUtils = {
  readFile: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = [
            { 'Product Name': 'Sample Product 1', 'Price': 29.99, 'Category': 'Electronics', 'Description': 'Sample description' },
            { 'Product Name': 'Sample Product 2', 'Price': 15.50, 'Category': 'Books', 'Description': 'Another description' }
          ];
          resolve(jsonData);
        } catch (error) {
          reject(new Error('Failed to read Excel file'));
        }
      };
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

const useFileUpload = () => {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStats, setUploadStats] = useState(null);

  const resetState = useCallback(() => {
    setPreviewData([]);
    setErrors([]);
    setUploadStats(null);
  }, []);

  const handleFileChange = useCallback(async (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    resetState();

    if (selectedFile) {
      try {
        const data = await ExcelUtils.readFile(selectedFile);
        setPreviewData(data.slice(0, 3));
      } catch (error) {
        setErrors([error.message]);
      }
    }
  }, [resetState]);

  const processFile = useCallback(async () => {
    if (!file) return { validProducts: [], errorMessages: ['Please select a file first.'] };

    try {
      const rawData = await ExcelUtils.readFile(file);
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

      return { validProducts, errorMessages };
    } catch (error) {
      return { validProducts: [], errorMessages: [error.message] };
    }
  }, [file]);

  return {
    file,
    previewData,
    errors,
    isProcessing,
    uploadStats,
    setErrors,
    setIsProcessing,
    setUploadStats,
    handleFileChange,
    processFile,
    resetState
  };
};

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={e => { if (e.target === e.currentTarget && onClose) onClose(); }}
      aria-modal="true"
      role="dialog"
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          maxWidth: '800px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
            Import Products from Excel
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '5px'
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div style={{ padding: '20px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

const Instructions = () => (
  <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
    <h3 style={{ margin: '0 0 10px 0' }}>Instructions:</h3>
    <ol style={{ margin: '0 0 15px 0', paddingLeft: '20px' }}>
      <li>Download the template file to see the required format</li>
      <li>Fill in your product data with columns: Product Name, Price, Category, Description</li>
      <li>Upload your Excel file (.xlsx or .xls)</li>
    </ol>
    <button 
      onClick={() => alert('Template download would happen here')}
      style={{
        backgroundColor: '#6b7280',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      📥 Download Template
    </button>
  </div>
);

const FileUploadSection = ({ file, onFileChange }) => (
  <div style={{ marginBottom: '20px' }}>
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={onFileChange}
        style={{
          position: 'absolute',
          opacity: 0,
          width: '100%',
          height: '100%',
          cursor: 'pointer'
        }}
        id="excel-upload"
      />
      <label
        htmlFor="excel-upload"
        style={{
          display: 'inline-block',
          padding: '10px 20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          borderRadius: '4px',
          cursor: 'pointer',
          border: '2px dashed #3b82f6'
        }}
      >
        {file ? `📁 ${file.name}` : '📁 Choose Excel File'}
      </label>
    </div>
  </div>
);

const PreviewTable = ({ data }) => {
  if (!data.length) return null;

  return (
    <div style={{ marginBottom: '20px' }}>
      <h4 style={{ margin: '0 0 10px 0' }}>Preview (First 3 rows):</h4>
      <div style={{ 
        border: '1px solid #d1d5db', 
        borderRadius: '4px', 
        overflow: 'auto',
        maxHeight: '300px'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              {Object.keys(data[0]).map(key => (
                <th key={key} style={{ 
                  padding: '8px 12px', 
                  textAlign: 'left', 
                  borderBottom: '1px solid #d1d5db',
                  fontWeight: 'bold'
                }}>
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 ? '#f9fafb' : 'white' }}>
                {Object.values(row).map((value, i) => (
                  <td key={i} style={{ 
                    padding: '8px 12px', 
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ErrorList = ({ errors }) => {
  if (!errors.length) return null;

  return (
    <div style={{ 
      marginBottom: '20px', 
      padding: '15px', 
      backgroundColor: '#fef2f2', 
      borderRadius: '6px',
      border: '1px solid #fecaca'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#dc2626' }}>Errors:</h4>
      <ul style={{ margin: 0, paddingLeft: '20px' }}>
        {errors.map((error, index) => (
          <li key={index} style={{ color: '#dc2626', marginBottom: '5px' }}>
            {error}
          </li>
        ))}
      </ul>
    </div>
  );
};

const UploadStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div style={{ 
      marginBottom: '20px', 
      padding: '15px', 
      backgroundColor: '#f0f9ff', 
      borderRadius: '6px',
      border: '1px solid #bae6fd'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#0369a1' }}>Upload Results:</h4>
      <p style={{ margin: '5px 0', color: '#065f46' }}>
        ✅ Successfully imported: {stats.success} products
      </p>
      {stats.failed > 0 && (
        <p style={{ margin: '5px 0', color: '#dc2626' }}>
          ❌ Failed to import: {stats.failed} products
        </p>
      )}
      <p style={{ margin: '5px 0', color: '#374151' }}>
        📊 Total processed: {stats.total} products
      </p>
    </div>
  );
};

const ExcelUpload = ({ onSuccess, onClose, isOpen = true }) => {
  const {
    file,
    previewData,
    errors,
    isProcessing,
    uploadStats,
    setErrors,
    setIsProcessing,
    setUploadStats,
    handleFileChange,
    processFile
  } = useFileUpload();

  const handleUpload = useCallback(async () => {
    if (!file) {
      setErrors(['Please select a file first.']);
      return;
    }
    setIsProcessing(true);
    setErrors([]);

    try {
      const { validProducts, errorMessages } = await processFile();

      if (errorMessages.length > 0) {
        setErrors(errorMessages);
      }

      if (validProducts.length === 0) {
        setErrors(prev => [...prev, 'No valid products found to import.']);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      const stats = {
        total: validProducts.length,
        success: validProducts.length,
        failed: 0
      };

      setUploadStats(stats);

      if (stats.success > 0 && typeof onSuccess === 'function') {
        setTimeout(() => onSuccess(), 1000);
      }

    } catch (error) {
      setErrors(['An unexpected error occurred while processing the file.']);
    } finally {
      setIsProcessing(false);
    }
  }, [file, processFile, onSuccess, setErrors, setIsProcessing, setUploadStats]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Instructions />
      <div>
        <FileUploadSection file={file} onFileChange={handleFileChange} />
        <PreviewTable data={previewData} />
        <ErrorList errors={errors} />
        <UploadStats stats={uploadStats} />
      </div>
      <div style={{
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end',
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <button
          onClick={onClose}
          disabled={isProcessing}
          style={{
            padding: '10px 20px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            opacity: isProcessing ? 0.5 : 1
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleUpload}
          disabled={!file || isProcessing}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: (!file || isProcessing) ? '#9ca3af' : '#3b82f6',
            color: 'white',
            cursor: (!file || isProcessing) ? 'not-allowed' : 'pointer'
          }}
        >
          {isProcessing ? 'Processing...' : 'Import Products'}
        </button>
      </div>
    </Modal>
  );
};

export default ExcelUpload;