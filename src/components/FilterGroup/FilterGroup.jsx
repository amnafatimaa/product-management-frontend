import styles from './FilterGroup.module.css';

const FilterGroup = ({ label, children }) => (
  <div className={styles.filterGroup}>
    <label className={styles.filterLabel}>{label}</label>
    {children}
  </div>
);

export default FilterGroup;