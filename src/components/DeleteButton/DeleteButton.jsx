import React, { useState } from 'react';
import styles from './DeleteButton.module.css';

const DeleteButton = ({ productId, productName, onDelete }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(productId);
      setShowConfirm(false);
    } catch (error) {
      console.error('Failed to delete product:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        className={styles.deleteButton}
        onClick={() => setShowConfirm(true)}
      >
        Delete
      </button>
      {showConfirm && (
        <div
          className={styles.modal}
          onClick={(e) => e.target === e.currentTarget && setShowConfirm(false)}
        >
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Confirm Delete</h3>
            <p className={styles.modalText}>
              Are you sure you want to delete "{productName}"? This action cannot be undone.
            </p>
            <div className={styles.buttonGroup}>
              <button
                type="button"
                className={`${styles.confirmButton} ${styles.secondary}`}
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`${styles.confirmButton} ${styles.danger}`}
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteButton;