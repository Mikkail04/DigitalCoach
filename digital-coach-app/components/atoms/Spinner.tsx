import React from 'react';
import styles from './Spinner.module.scss';

interface SpinnerProps {
  message?: string;
}

export default function Spinner({ message = "Loading..." }: SpinnerProps) {
  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.loader}></div>
      <p>{message}</p>
    </div>
  );
}