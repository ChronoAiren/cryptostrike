import React from 'react';
import styles from './PhoneWrapper.module.css';

interface PhoneWrapperProps {
  children: React.ReactNode;
}

export const PhoneWrapper: React.FC<PhoneWrapperProps> = ({ children }) => {
  return (
    <div className={styles.container}>
      <div className={styles.phoneFrame}>
        <div className={styles.statusBar}>
          <div className={styles.notch}></div>
          <span className={styles.statusTime}>9:41</span>
          <div className={styles.statusIcons}>
            <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
              <path d="M1 3.5C1 2.67 1.67 2 2.5 2h1C4.33 2 5 2.67 5 3.5v3C5 7.33 4.33 8 3.5 8h-1C1.67 8 1 7.33 1 6.5v-3zm4.5 0c0-.83.67-1.5 1.5-1.5h1c.83 0 1.5.67 1.5 1.5v3c0 .83-.67 1.5-1.5 1.5h-1c-.83 0-1.5-.67-1.5-1.5v-3zm4.5 0c0-.83.67-1.5 1.5-1.5h1c.83 0 1.5.67 1.5 1.5v3c0 .83-.67 1.5-1.5 1.5h-1c-.83 0-1.5-.67-1.5-1.5v-3z"/>
            </svg>
            <svg width="12" height="10" viewBox="0 0 12 10" fill="currentColor">
              <path d="M6 2c2.2 0 4.2.9 5.7 2.3.2.2.3.5.3.7s-.1.5-.3.7C10.2 7.1 8.2 8 6 8s-4.2-.9-5.7-2.3c-.2-.2-.3-.5-.3-.7s.1-.5.3-.7C1.8 2.9 3.8 2 6 2z"/>
            </svg>
            <svg width="20" height="10" viewBox="0 0 20 10" fill="currentColor">
              <rect x="0" y="1" width="16" height="8" rx="2" stroke="currentColor" fill="none" strokeWidth="1"/>
              <rect x="2" y="3" width="10" height="4" rx="1" fill="currentColor"/>
              <rect x="17" y="3.5" width="2" height="3" rx="0.5"/>
            </svg>
          </div>
        </div>
        <div className={styles.screenContent}>
          {children}
        </div>
        <div className={styles.homeIndicatorBar}>
          <div className={styles.homeIndicator}></div>
        </div>
      </div>
    </div>
  );
};
