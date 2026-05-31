import React from 'react';
import styles from './PhoneWrapper.module.css';

interface PhoneWrapperProps {
  children: React.ReactNode;
}

export const PhoneWrapper: React.FC<PhoneWrapperProps> = ({ children }) => {
  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        {children}
      </div>
    </div>
  );
};
