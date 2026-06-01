import React from 'react';
import styles from './PhoneWrapper.module.css';

interface PhoneWrapperProps {
  children: React.ReactNode;
  wide?: boolean;
}

export const PhoneWrapper: React.FC<PhoneWrapperProps> = ({ children, wide }) => {
  return (
    <div className={styles.container}>
      <div className={[styles.inner, wide && styles.wide].filter(Boolean).join(' ')}>
        {children}
      </div>
    </div>
  );
};
