import React from 'react';
import styles from './DataTable.module.css';
import DeleteButton from '../DeleteButton/DeleteButton';

// Reusable Table Components
const TableHeaderCell = ({ column, sortBy, sortOrder, onSort }) => {
  const handleSort = () => {
    if (onSort && column.sortable) {
      const newOrder = sortBy === column.key && sortOrder === 'asc' ? 'desc' : 'asc';
      onSort(column.key, newOrder);
    }
  };

  const getSortIcon = () => {
    if (sortBy === column.key) {
      return sortOrder === 'asc' ? '↑' : '↓';
    }
    return '↕';
  };

  return (
    <th
      className={`${styles.tableHeader} ${column.sortable ? styles.sortable : ''}`}
      onClick={handleSort}
    >
      {column.label}
      {column.sortable && <span className={styles.sortIcon}>{getSortIcon()}</span>}
    </th>
  );
};

const TableRowCell = ({ value, column }) => {
  const formatValue = (val, col) => {
    if (col.key === 'price') {
      return `$${parseFloat(val).toFixed(2)}`;
    }
    if (col.key === 'created_at' || col.key === 'updated_at') {
      return new Date(val).toLocaleDateString();
    }
    if (col.key === 'description' && val && val.length > 100) {
      return val.substring(0, 100) + '...';
    }
    return val || '-';
  };

  return <td className={styles.tableCell}>{formatValue(value, column)}</td>;
};

const PaginationButton = ({ pageNum, isActive, isDisabled, onClick, children }) => (
  <button
    className={`${styles.paginationButton} ${isActive ? styles.active : ''}`}
    disabled={isDisabled}
    onClick={onClick}
  >
    {children}
  </button>
);

const Pagination = ({ pagination, onPageChange }) => {
  const { page, total_pages, limit, total } = pagination;

  const renderPagination = () => {
    const pages = [];
    if (page > 3) {
      pages.push(1);
      if (page > 4) pages.push('...');
    }
    for (let i = Math.max(1, page - 2); i <= Math.min(total_pages, page + 2); i++) {
      pages.push(i);
    }
    if (page < total_pages - 2) {
      if (page < total_pages - 3) pages.push('...');
      pages.push(total_pages);
    }

    return pages.map((pageNum, index) => (
      <PaginationButton
        key={index}
        pageNum={pageNum}
        isActive={pageNum === page}
        isDisabled={pageNum === '...'}
        onClick={() => typeof pageNum === 'number' && onPageChange(pageNum)}
      >
        {pageNum}
      </PaginationButton>
    ));
  };

  return (
    <div className={styles.paginationContainer}>
      <div className={styles.paginationInfo}>
        Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} products
      </div>
      <div className={styles.paginationControls}>
        <PaginationButton
          isDisabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </PaginationButton>
        {renderPagination()}
        <PaginationButton
          isDisabled={page >= total_pages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </PaginationButton>
      </div>
    </div>
  );
};

const DataTable = ({
  columns,
  data,
  pagination,
  onSort,
  onPageChange,
  onEdit,
  onDelete,
  sortBy,
  sortOrder
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.emptyState}>
          <h3>No products found</h3>
          <p>Try adjusting your search filters or create a new product.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <TableHeaderCell
                key={column.key}
                column={column}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
            ))}
            <th className={styles.tableHeader}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className={styles.tableRow}>
              {columns.map((column) => (
                <TableRowCell
                  key={column.key}
                  value={item[column.key]}
                  column={column}
                />
              ))}
              <td className={styles.tableCell}>
                <div className={styles.actionButtons}>
                  <button
                    onClick={() => onEdit(item)}
                    className={styles.editButton}
                  >
                    Edit
                  </button>
                  <DeleteButton
                    productId={item.id}
                    productName={item.name}
                    onDelete={() => onDelete(item.id)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {pagination && (
        <Pagination pagination={pagination} onPageChange={onPageChange} />
      )}
    </div>
  );
};

export default DataTable;