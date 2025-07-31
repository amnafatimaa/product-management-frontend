import styles from './ErrorContainer.module.css';

const ErrorContainer = ({ error }) => (
  <div className={styles.errorContainer}>
    {error}
  </div>
);

export default ErrorContainer;