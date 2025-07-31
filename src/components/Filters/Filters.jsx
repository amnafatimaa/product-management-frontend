import styles from './Filters.module.css';
import FilterGroup from '../FilterGroup/FilterGroup';

const Filters = ({ filters, categories, onFilterChange, onLimitChange, pagination }) => {
  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filtersRow}>
        
        {/* Search */}
        <div className={styles.filterGroup}>
          <FilterGroup label="Search">
            <input
              type="text"
              className={styles.filterInput}
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
            />
          </FilterGroup>
        </div>

        {/* Category */}
        <div className={styles.filterGroup}>
          <FilterGroup label="Category">
            <select
              className={styles.filterSelect}
              value={filters.category}
              onChange={(e) => onFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </FilterGroup>
        </div>

        {/* Price Range */}
        <div className={styles.filterGroup}>
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
        </div>

        {/* Items per page */}
        <div className={styles.filterGroup}>
          <FilterGroup label="Items per page">
            <select
              className={styles.filterSelect}
              value={pagination.limit}
              onChange={(e) => onLimitChange(parseInt(e.target.value))}
            >
              {[5, 10, 25, 50].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </FilterGroup>
        </div>

      </div>
    </div>
  );
};

export default Filters;
