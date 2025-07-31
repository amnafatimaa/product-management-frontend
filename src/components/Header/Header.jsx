import styles from './Header.module.css';

const Header = ({ title, onCreateClick }) => (
  <div className={styles.header}>
    <h1 className={styles.title}>{title}</h1>
    <button className={styles.createButton} onClick={onCreateClick}>
      + Create Product
    </button>
  </div>
);

export default Header;