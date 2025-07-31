import React from 'react';
import styles from './Header.module.css';

const Header = ({ title, onCreateClick, onExcelUploadClick }) => (
  <div className={styles.header}>
    <h1 className={styles.title}>{title}</h1>
    <div className={styles.buttons}>
      <button className={styles.createButton} onClick={onCreateClick}>
        + Create Product
      </button>
      <button className={styles.excelButton} onClick={onExcelUploadClick}>
        Upload Excel
      </button>
    </div>
  </div>
);

export default Header;